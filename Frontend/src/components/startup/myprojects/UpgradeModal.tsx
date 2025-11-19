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
      message.error("Số dư ví không đủ.");
      return;
    }
    setPurchaseLoading((prev) => ({ ...prev, [pkg.id]: true }));
    try {
      await paymentService.purchaseWithWallet(pkg.id); //
      message.success("Nâng cấp gói thành công!");
      // Refresh lại thông tin user (để cập nhật projectLimit mới)
      if (user?.id) {
        dispatch(getStartupProfile(user.id));
      }
      onClose();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Lỗi khi mua bằng ví");
    } finally {
      setPurchaseLoading((prev) => ({ ...prev, [pkg.id]: false }));
    }
  };

  const handlePurchaseGateway = async (packageId: number) => {
    setPurchaseLoading((prev) => ({ ...prev, [packageId]: true }));
    try {
      const { paymentUrl } = await paymentService.createPackageOrder(packageId); //
      message.loading("Đang chuyển hướng đến cổng thanh toán...", 1);
      setTimeout(() => {
        window.location.href = paymentUrl; // Chuyển hướng
      }, 1000);
    } catch (error: any) {
      message.error(error.response?.data?.message || "Lỗi khi tạo đơn hàng");
      setPurchaseLoading((prev) => ({ ...prev, [packageId]: false }));
    }
  };

  return (
    <Modal
      title="Nâng cấp Gói Project"
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      <Text type="secondary" style={{ marginBottom: 16, display: "block" }}>
        Bạn đã đạt giới hạn số lượng project. Vui lòng chọn một gói bên dưới để
        tiếp tục.
      </Text>
      <Text strong>
        Số dư ví của bạn: {walletBalance.toLocaleString("vi-VN")} VNĐ
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
                Mua bằng Ví
              </Button>
              <Button
                loading={purchaseLoading[pkg.id]}
                onClick={() => handlePurchaseGateway(pkg.id)}
              >
                Thanh toán (PayOS)
              </Button>
            </div>
            {walletBalance < pkg.price && (
              <Text type="danger" style={{ display: "block", marginTop: 8 }}>
                Không đủ số dư ví. Vui lòng nạp thêm hoặc thanh toán qua PayOS.
              </Text>
            )}
          </Card>
        ))}
    </Modal>
  );
};
