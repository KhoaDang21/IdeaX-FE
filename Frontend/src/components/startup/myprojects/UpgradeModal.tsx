import React, { useEffect, useState } from "react";
import { Modal, Button, Card, message, Typography } from "antd";
import InlineLoading from "../../InlineLoading";
import { useSelector, useDispatch } from "react-redux";
import { type RootState, type AppDispatch } from "../../../store";
import { fetchPackages } from "../../../services/features/payment/packageSlice";
import paymentService from "../../../services/features/payment/paymentService";
import { getMyWallet } from "../../../services/features/payment/paymentSlice";
import { setUser } from "../../../services/features/auth/authSlice";

const { Text, Title } = Typography;

interface Props {
  open: boolean;
  onClose: () => void;
}

export const UpgradeModal: React.FC<Props> = ({ open, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();

  const { packages, loading } = useSelector(
    (state: RootState) => state.package
  );

  const { wallet } = useSelector((state: RootState) => state.payment);
  const { user } = useSelector((state: RootState) => state.auth);

  const currentBalance = Number(wallet?.balance ?? user?.walletBalance ?? 0);

  const [purchaseLoading, setPurchaseLoading] = useState<
    Record<number, boolean>
  >({});

  useEffect(() => {
    if (open) {
      dispatch(fetchPackages());
      dispatch(getMyWallet());
    }
  }, [open, dispatch]);

  const handlePurchaseWallet = async (pkg: any) => {
    if (currentBalance < pkg.price) {
      message.error("Insufficient wallet balance.");
      return;
    }
    setPurchaseLoading((prev) => ({ ...prev, [pkg.id]: true }));
    try {
      // --- GỌI API VÀ NHẬN KẾT QUẢ TỪ BACKEND ---
      const response = await paymentService.purchaseWithWallet(pkg.id);
      // response chứa: { walletBalance: number, projectLimit: number, message: string }

      message.success("Package upgraded successfully!");

      // --- CẬP NHẬT STATE & LOCALSTORAGE DỰA TRÊN DỮ LIỆU CHUẨN TỪ SERVER ---
      if (user) {
        const updatedUser = {
          ...user,
          // Lấy trực tiếp số liệu từ Server trả về, không cần tự tính toán
          projectLimit: response.projectLimit,
          walletBalance: response.walletBalance,
        };

        // 1. Cập nhật Redux (Giao diện đổi ngay)
        dispatch(setUser(updatedUser));

        // 2. Cập nhật LocalStorage (Giữ số liệu khi F5)
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
      // -----------------------------------------------------------

      dispatch(getMyWallet()); // Đồng bộ lại ví lần nữa cho chắc chắn
      onClose();
    } catch (error: any) {
      message.error(
        error.response?.data?.message || "Error purchasing with wallet"
      );
    } finally {
      setPurchaseLoading((prev) => ({ ...prev, [pkg.id]: false }));
    }
  };

  const handlePurchaseGateway = async (packageId: number) => {
    setPurchaseLoading((prev) => ({ ...prev, [packageId]: true }));
    try {
      const { paymentUrl } = await paymentService.createPackageOrder(packageId);
      message.loading("Redirecting to payment gateway...", 1);
      setTimeout(() => {
        window.location.href = paymentUrl;
      }, 1000);
    } catch (error: any) {
      message.error(error.response?.data?.message || "Error creating order");
      setPurchaseLoading((prev) => ({ ...prev, [packageId]: false }));
    }
  };

  return (
    <Modal
      title="Upgrade Package"
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      <Text type="secondary" style={{ marginBottom: 16, display: "block" }}>
        You have reached the project limit. Please choose a package below to
        continue.
      </Text>

      <Text strong style={{ fontSize: 16 }}>
        Wallet balance:{" "}
        <span style={{ color: "#1890ff" }}>
          {currentBalance.toLocaleString("en-US")} VND
        </span>
      </Text>

      {loading && <InlineLoading />}
      {!loading &&
        packages.map((pkg) => (
          <Card key={pkg.id} style={{ marginTop: 16 }}>
            <Title level={4}>{pkg.packageName}</Title>
            <Text>{pkg.description}</Text>
            <Title level={3} style={{ color: "#1890ff", margin: "12px 0" }}>
              {pkg.price.toLocaleString("vi-VN")} VNĐ
            </Title>
            <div style={{ display: "flex", gap: 12 }}>
              <Button
                type="primary"
                loading={purchaseLoading[pkg.id]}
                disabled={currentBalance < pkg.price}
                onClick={() => handlePurchaseWallet(pkg)}
              >
                Buy with Wallet
              </Button>
              <Button
                loading={purchaseLoading[pkg.id]}
                onClick={() => handlePurchaseGateway(pkg.id)}
              >
                Pay (PayOS)
              </Button>
            </div>
            {currentBalance < pkg.price && (
              <Text type="danger" style={{ display: "block", marginTop: 8 }}>
                Insufficient wallet balance. Please top up or pay via PayOS.
              </Text>
            )}
          </Card>
        ))}
    </Modal>
  );
};
