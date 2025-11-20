import api from "../../constant/axiosInstance";

// Kiểu dữ liệu trả về từ API /create-package-order
interface PackageOrderResponse {
  paymentUrl: string;
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

// --- THÊM INTERFACE MỚI KHỚP VỚI BACKEND DTO ---
export interface PurchaseResponse {
  message: string;
  walletBalance: number; // Số dư mới từ DB
  projectLimit: number;  // Limit mới từ DB
}

const fetchActivePackages = async (): Promise<UpgradePackage[]> => {
  const response = await api.get<UpgradePackage[]>("/api/upgrade-packages");
  return response.data;
};

/**
 * Mua gói bằng cách trừ tiền từ ví
 * API: POST /api/payments/purchase-with-wallet
 * Đã sửa: Trả về PurchaseResponse thay vì void
 */
const purchaseWithWallet = async (packageId: number): Promise<PurchaseResponse> => {
  const response = await api.post<PurchaseResponse>("/api/payments/purchase-with-wallet", { packageId });
  return response.data; // Trả về cục dữ liệu { walletBalance, projectLimit }
};

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