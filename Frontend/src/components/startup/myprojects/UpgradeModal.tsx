import React, { useEffect, useState } from "react";
import { Modal, Button, Card, message, Typography } from "antd";
import InlineLoading from '../../InlineLoading'
import { useSelector, useDispatch } from "react-redux";
import { type RootState, type AppDispatch } from "../../../store";
import { fetchPackages } from "../../../services/features/payment/packageSlice";
import paymentService from "../../../services/features/payment/paymentService";
import { getStartupProfile } from "../../../services/features/auth/authSlice"; // Import action refresh profile

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
  const { user } = useSelector((state: RootState) => state.auth);
  const walletBalance = user?.walletBalance || 0; // Giả sử bạn lưu số dư ví ở đây

  const [purchaseLoading, setPurchaseLoading] = useState<
    Record<number, boolean>
  >({});

  useEffect(() => {
    if (open) {
      dispatch(fetchPackages());
    }
  }, [open, dispatch]);

  const handlePurchaseWallet = async (pkg: { id: number; price: number }) => {
    if (walletBalance < pkg.price) {
      message.error("Insufficient wallet balance.");
      return;
    }
    setPurchaseLoading((prev) => ({ ...prev, [pkg.id]: true }));
    try {
      await paymentService.purchaseWithWallet(pkg.id); //
      message.success("Package upgraded successfully!");
      // Refresh lại thông tin user (để cập nhật projectLimit mới)
      if (user?.id) {
        dispatch(getStartupProfile(user.id));
      }
      onClose();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Error purchasing with wallet");
    } finally {
      setPurchaseLoading((prev) => ({ ...prev, [pkg.id]: false }));
    }
  };

  const handlePurchaseGateway = async (packageId: number) => {
    setPurchaseLoading((prev) => ({ ...prev, [packageId]: true }));
    try {
      const { paymentUrl } = await paymentService.createPackageOrder(packageId); //
      message.loading("Redirecting to payment gateway...", 1);
      setTimeout(() => {
        window.location.href = paymentUrl; // Chuyển hướng
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
        You have reached the project limit. Please choose a package below to continue.
      </Text>
      <Text strong>
        Wallet balance: {walletBalance.toLocaleString('en-US')} VND
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
                disabled={walletBalance < pkg.price}
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
            {walletBalance < pkg.price && (
              <Text type="danger" style={{ display: "block", marginTop: 8 }}>
                Insufficient wallet balance. Please top up or pay via PayOS.
              </Text>
            )}
          </Card>
        ))}
    </Modal>
  );
};
