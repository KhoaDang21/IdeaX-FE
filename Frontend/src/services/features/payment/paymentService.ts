import api from "../../constant/axiosInstance";

// Kiểu dữ liệu trả về từ API /create-package-order
interface PackageOrderResponse {
  paymentUrl: string;
  // ... các trường khác nếu có
}

// Kiểu dữ liệu trả về từ API /upgrade-packages
export interface UpgradePackage {
  id: number;
  packageName: string;
  description: string;
  price: number;
  projectsToAdd: number;
  isActive: boolean;
}

/**
 * Lấy danh sách các gói nâng cấp đang active
 * API: GET /api/upgrade-packages
 */
const fetchActivePackages = async (): Promise<UpgradePackage[]> => {
  const response = await api.get<UpgradePackage[]>("/api/upgrade-packages");
  return response.data;
};

/**
 * Mua gói bằng cách trừ tiền từ ví
 * API: POST /api/payments/purchase-with-wallet
 */
const purchaseWithWallet = async (packageId: number): Promise<void> => {
  await api.post("/api/payments/purchase-with-wallet", { packageId });
};

/**
 * Tạo đơn hàng (PayOS/VNPay) để mua gói
 * API: POST /api/payments/create-package-order
 */
const createPackageOrder = async (packageId: number): Promise<PackageOrderResponse> => {
  const response = await api.post<PackageOrderResponse>("/api/payments/create-package-order", { packageId });
  return response.data;
};

const paymentService = {
  fetchActivePackages,
  purchaseWithWallet,
  createPackageOrder,
};

export default paymentService;