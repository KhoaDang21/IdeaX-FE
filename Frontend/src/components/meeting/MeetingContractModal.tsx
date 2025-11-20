import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  InputNumber,
  Input,
  Typography,
  Tag,
  Space,
  Alert,
  Divider,
  Descriptions,
  Checkbox,
  Button,
  message,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import type { Meeting } from "../../services/features/meeting/meetingSlice";
import type {
  ContractSignPayload,
  ContractStatus,
} from "../../types/contract";
import {
  previewContract,
  signMeetingContract,
  fetchContractByMeeting,
} from "../../services/features/contract/contractSlice";
import type { RootState, AppDispatch } from "../../store";
import { api } from "../../services/constant/axiosInstance";
import ContractPreviewOverlay from "./contract/ContractPreviewOverlay";
import SignatureCard from "./contract/SignatureCard";

const { Text, Paragraph } = Typography;

interface MeetingContractModalProps {
  open: boolean;
  meeting?: Meeting | null;
  isInvestor: boolean;
  userId?: number;
  onCancel: () => void;
  onAfterAction?: () => void;
}

const statusMap: Record<ContractStatus, { color: string; label: string }> = {
  NOT_READY: { color: "default", label: "Chờ hoàn tất NDA" },
  WAITING_INVESTOR_SIGNATURE: { color: "gold", label: "Chờ nhà đầu tư ký" },
  WAITING_STARTUP_SIGNATURE: { color: "blue", label: "Chờ startup ký" },
  FULLY_SIGNED: { color: "green", label: "Đã ký và giải ngân" },
};

const MeetingContractModal: React.FC<MeetingContractModalProps> = ({
  open,
  meeting,
  isInvestor,
  userId,
  onCancel,
  onAfterAction,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { current: contract, preview, loading, error } = useSelector(
    (s: RootState) => s.contract
  );
  const [form] = Form.useForm<ContractSignPayload>();
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  useEffect(() => {
    if (!open) {
      form.resetFields();
      setAcceptTermsChecked(false);
      return;
    }
    const defaults: ContractSignPayload = {
      investmentAmount:
        contract?.investmentAmount ??
        preview?.investmentAmount ??
        meeting?.projectMinimumInvestment,
      equitySharePercent:
        contract?.equitySharePercent ??
        preview?.equitySharePercent ??
        undefined,
      investmentDurationMonths:
        contract?.investmentDurationMonths ??
        preview?.investmentDurationMonths ??
        undefined,
      milestone:
        contract?.milestone ??
        preview?.milestone ??
        `1. Hoàn thiện bộ hồ sơ pháp lý và kế hoạch vận hành dự án ${meeting?.projectName ?? ""
        } trong 30 ngày.\n2. Báo cáo chỉ số tăng trưởng người dùng sau quý đầu.\n3. Tổng kết KPI và định giá lại sau 12 tháng.`,
      acceptTerms: false,
    };
    form.setFieldsValue(defaults);
    if (isInvestor) {
      (async () => {
        try {
          const res = await api.get(`/api/payments/wallet/me`);
          const bal = Number(res.data?.balance || 0);
          setWalletBalance(isNaN(bal) ? 0 : bal);
        } catch {
          setWalletBalance(null);
        }
      })();
    }
  }, [
    open,
    contract?.investmentAmount,
    contract?.equitySharePercent,
    contract?.investmentDurationMonths,
    contract?.milestone,
    meeting?.projectName,
    meeting?.projectMinimumInvestment,
    preview?.investmentAmount,
    preview?.equitySharePercent,
    preview?.investmentDurationMonths,
    preview?.milestone,
    form,
  ]);

  const displayedContract = preview ?? contract;
  const currentStatus = displayedContract?.status ?? "NOT_READY";
  const statusInfo = statusMap[currentStatus];
  const ndaCompleted = displayedContract?.ndaCompleted ?? contract?.ndaCompleted ?? false;
  const investorSigned = contract?.investorSigned ?? false;
  const startupSigned = contract?.startupSigned ?? false;
  const investorFlowReady = isInvestor && ndaCompleted && !investorSigned;
  const startupFlowReady = !isInvestor && ndaCompleted && investorSigned && !startupSigned;

  const fundingAmount = meeting?.projectFundingAmount ?? displayedContract?.projectFundingAmount ?? 0;
  const fundingReceived = meeting?.projectFundingReceived ?? displayedContract?.projectFundingReceived ?? 0;
  const remainingFunding = Math.max(0, Number(fundingAmount || 0) - Number(fundingReceived || 0));
  const minimumInvestment = meeting?.projectMinimumInvestment ?? displayedContract?.projectMinimumInvestment ?? 0;
  const hideStatusForStartup = !isInvestor && currentStatus === "WAITING_STARTUP_SIGNATURE";

  const contractHtml =
    displayedContract?.contractHtml ||
    "<p>Điền đủ thông tin ở biểu mẫu rồi bấm <strong>Xem trước hợp đồng</strong> để tạo bản nháp.</p>";

  const contractHasHeader = /HỢP ĐỒNG ĐẦU TƯ STARTUP|IDEAX\/\d{1,2}\/\d{1,2}\/\d{4}\/INV/i.test(
    contractHtml
  );
  const contractHasSignature = /signature-block|signature-grid|Ký và ghi rõ họ tên/i.test(contractHtml);

  // Hiển thị hợp đồng khi:
  // - Investor đã ký (để startup thấy) hoặc cả 2 đã ký (để cả 2 thấy)
  // - Không phải preview
  const showContractBlock = Boolean(
    displayedContract?.contractHtml &&
    (displayedContract?.investorSigned || displayedContract?.startupSigned) &&
    !preview
  );

  const handleGeneratePreview = async () => {
    if (!meeting || !userId) {
      message.error("Thiếu thông tin meeting hoặc user.");
      return;
    }
    try {
      const values = await form.validateFields([
        "investmentAmount",
        "equitySharePercent",
        "investmentDurationMonths",
        "milestone",
      ]);
      await dispatch(
        previewContract({
          meetingId: meeting.id,
          userId,
          payload: values,
        })
      ).unwrap();
      message.success("Đã tạo bản nháp hợp đồng với chữ ký nhà đầu tư.");
      setPreviewModalOpen(true);
    } catch (err: any) {
      if (!err?.errorFields) {
        message.error(err?.message || "Không thể tạo bản nháp.");
      }
    }
  };

  const executeSign = async (payload: ContractSignPayload) => {
    if (!meeting || !userId) {
      message.error("Thiếu thông tin meeting hoặc user.");
      return;
    }
    await dispatch(
      signMeetingContract({
        meetingId: meeting.id,
        userId,
        payload,
      })
    ).unwrap();
    await dispatch(fetchContractByMeeting({ meetingId: meeting.id, userId }));
    onAfterAction?.();
  };

  const handleConfirmSend = async () => {
    try {
      // Validate tất cả fields bao gồm acceptTerms
      const values = await form.validateFields();

      // Kiểm tra checkbox acceptTerms
      if (!values.acceptTerms) {
        message.error("Vui lòng đồng ý với điều khoản trước khi gửi hợp đồng.");
        return;
      }
      try {
        await executeSign(values);
        message.success(
          isInvestor
            ? "Đã gửi hợp đồng cho startup."
            : "Bạn đã ký hợp đồng thành công."
        );
        setPreviewModalOpen(false);
      } catch (err: any) {
        message.error(err?.message || "Không thể gửi hợp đồng");
      }
    } catch (err: any) {
      if (!err?.errorFields) {
        message.error(err?.message || "Vui lòng điền đầy đủ thông tin");
      }
    }
  };

  // Signing flow when viewing contract (used by startup when investor already sent)
  const handleSignFromView = async () => {
    if (!meeting || !userId) {
      message.error("Thiếu thông tin meeting hoặc user.");
      return;
    }
    if (!acceptTermsChecked) {
      message.error("Vui lòng đồng ý với điều khoản trước khi ký hợp đồng.");
      return;
    }

    try {
      await executeSign({ acceptTerms: true });
      message.success("Bạn đã ký hợp đồng thành công.");
      setPreviewModalOpen(false);
    } catch (err: any) {
      message.error(err?.message || "Không thể gửi hợp đồng");
    }
  };

  const [acceptTermsChecked, setAcceptTermsChecked] = useState(false);
  const disabledSend =
    (!ndaCompleted && isInvestor) ||
    (investorFlowReady && !acceptTermsChecked) ||
    (isInvestor && investorSigned) ||
    // require preview created by investor before sending
    (investorFlowReady && !(preview && preview.preview));

  return (
    <Modal
      open={open}
      title="Hợp đồng đầu tư"
      width={900}
      footer={null}
      onCancel={onCancel}
      destroyOnClose
    >
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        {!hideStatusForStartup && (
          <Space align="center" wrap>
            <Text strong>Trạng thái:</Text>
            <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
            {contract?.fundsReleased && (
              <Tag color="green">
                Đã giải ngân {contract?.paymentId ? `(#${contract.paymentId})` : ""}
              </Tag>
            )}
            {preview?.preview && (
              <Tag color="purple">ĐANG HIỂN THỊ BẢN NHÁP</Tag>
            )}
          </Space>
        )}

        {!ndaCompleted && (
          <Alert
            type="warning"
            message="Cần hoàn tất NDA của cả hai bên trước khi tạo hợp đồng."
            showIcon
          />
        )}

        {error && (
          <Alert type="error" message={error} showIcon />
        )}

        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="Dự án">
            {meeting?.projectName || displayedContract?.projectName || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Chủ đề meeting">
            {meeting?.topic || displayedContract?.meetingTopic || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Nhà đầu tư">
            {displayedContract?.investorName || meeting?.investorFullName || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Startup">
            {meeting?.startupFullName || displayedContract?.startupName || contract?.startupName || meeting?.startupName || "N/A"}
          </Descriptions.Item>
        </Descriptions>

        {showContractBlock && (
          <div
            style={{
              border: "1px solid #d9d9d9",
              borderRadius: 6,
              padding: 16,
              maxHeight: 420,
              overflow: "auto",
              background: "#f8fafc",
            }}
          >
            {/* Only inject our header/preamble if backend didn't already include it */}
            {!contractHasHeader && (
              <>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ textAlign: "center", fontWeight: 700, fontSize: 16 }}>HỢP ĐỒNG ĐẦU TƯ STARTUP</div>
                  <div style={{ textAlign: "center", marginTop: 6, fontSize: 12 }}>Số: IDEAX/20/11/2025/INV</div>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 600 }}>Căn cứ:</div>
                  <div style={{ marginTop: 6 }}>
                    <div>1. Luật Doanh nghiệp và các văn bản pháp luật liên quan tại Việt Nam.</div>
                    <div>2. Thỏa thuận bảo mật (NDA) đã được hai bên ký kết trên nền tảng IdeaX.</div>
                    <div>3. Nhu cầu hợp tác, đầu tư giữa {displayedContract?.investorName || meeting?.investorFullName || 'Nhà đầu tư'} và {meeting?.startupFullName || displayedContract?.startupName || contract?.startupName || meeting?.startupName || 'Startup'}.</div>
                  </div>
                </div>
              </>
            )}

            <div dangerouslySetInnerHTML={{ __html: contractHtml }} />

            {/* Signature area shown when investor or startup signature exists, or when startup can sign */}
            {/* Avoid rendering if contractHtml already contains signature blocks to prevent duplication */}
            {!contractHasSignature && (investorSigned || startupSigned || startupFlowReady) && (
              <div style={{ marginTop: 16, borderTop: "1px solid #d9d9d9", padding: "20px 0" }}>
                <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                  <SignatureCard
                    label="NHÀ ĐẦU TƯ"
                    signatureHtml={displayedContract?.investorSignatureHtml}
                    personName={displayedContract?.investorName || meeting?.investorFullName || "Nhà đầu tư"}
                    signedAtText={
                      displayedContract?.investorSignedAt
                        ? `Thời gian: ${displayedContract.investorSignedAt}`
                        : "Ngày ... tháng ... năm 20..."
                    }
                  />

                  <SignatureCard
                    label="STARTUP"
                    signatureHtml={displayedContract?.startupSignatureHtml}
                    personName={
                      meeting?.startupFullName ||
                      displayedContract?.startupName ||
                      contract?.startupName ||
                      meeting?.startupName ||
                      "Startup"
                    }
                    signedAtText={
                      displayedContract?.startupSignedAt
                        ? `Thời gian: ${displayedContract.startupSignedAt}`
                        : "Chờ ký"
                    }
                  />
                </div>

                {/* If contract view and startup can sign, we'll show checkbox + sign in footer (handled below) */}
                {startupFlowReady && (
                  <div style={{ marginTop: 12, textAlign: "right", color: "#666", fontSize: 12 }}>
                    {/* small helper text; actual controls are in footer */}
                    Vui lòng xác nhận điều khoản và bấm "Ký hợp đồng" để hoàn tất.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {!showContractBlock && (
          <>
            <Divider />

            <Form layout="vertical" form={form}>
          {isInvestor && (
            <>
              <Form.Item
                name="investmentAmount"
                label="Số tiền đầu tư (VND)"
                rules={[
                  {
                    validator: (_, value) => {
                      const raw = value;
                      const num = Number(raw || 0);
                      if (walletBalance !== null && walletBalance <= 0) {
                        return Promise.reject(new Error("Tài khoản không có tiền trong ví."));
                      }
                      if ((raw === undefined || raw === null || raw === "") && investorFlowReady) {
                        return Promise.reject(new Error("Vui lòng nhập số tiền đầu tư"));
                      }
                      if (!/^\d+$/.test(String(raw ?? ""))) {
                        return Promise.reject(new Error("Chỉ được nhập số"));
                      }
                      if (walletBalance !== null && num > walletBalance) {
                        return Promise.reject(new Error("Số dư ví không đủ."));
                      }
                      if (remainingFunding <= 0) {
                        return Promise.reject(new Error("Dự án đã đạt đủ mục tiêu gọi vốn, không thể đầu tư thêm."));
                      }
                      if (num < Number(minimumInvestment || 0)) {
                        return Promise.reject(new Error(`Ít nhất ${Number(minimumInvestment || 0).toLocaleString("vi-VN")} VND`));
                      }
                      if (num > remainingFunding) {
                        return Promise.reject(new Error(`Tối đa ${remainingFunding.toLocaleString("vi-VN")} VND`));
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <InputNumber
                  min={meeting?.projectMinimumInvestment || 0}
                  max={remainingFunding > 0 ? remainingFunding : undefined}
                  style={{ width: "100%" }}
                  step={1000000}
                  formatter={(value) =>
                    `${value ?? ""}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value?.replace(/\$\s?|(,*)/g, "") as any}
                />
                <div style={{ marginTop: 6 }}>
                  <Text type="secondary">
                    Khoảng hợp lệ: tối thiểu {Number(minimumInvestment || 0).toLocaleString("vi-VN")} VND,
                    tối đa {remainingFunding.toLocaleString("vi-VN")} VND.
                    {walletBalance !== null && ` — Số dư ví: ${Number(walletBalance || 0).toLocaleString("vi-VN")} VND.`}
                  </Text>
                </div>
              </Form.Item>
                  <Form.Item
                    name="equitySharePercent"
                    label="Tỷ lệ cổ phần (%)"
                    rules={[
                      {
                        required: investorFlowReady,
                        message: "Vui lòng nhập tỷ lệ cổ phần",
                      },
                      {
                        pattern: /^\d+(\.\d+)?$/,
                        message: "Chỉ được nhập số",
                      },
                    ]}
                  >
                    <InputNumber
                      min={1}
                      max={100}
                      style={{ width: "100%" }}
                      parser={(value) => value?.replace(/%/g, "") as any}
                    />
                  </Form.Item>
                  <Form.Item
                    name="investmentDurationMonths"
                    label="Thời hạn giải ngân (tháng)"
                    rules={[
                      {
                        required: investorFlowReady,
                        message: "Vui lòng nhập thời hạn giải ngân",
                      },
                      {
                        pattern: /^\d+$/,
                        message: "Chỉ được nhập số",
                      },
                    ]}
                  >
                    <InputNumber
                      min={1}
                      max={60}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </>
              )}

              <Form.Item name="milestone" label="Mốc bàn giao & KPI">
                <Input.TextArea rows={4} readOnly={!investorFlowReady} />
              </Form.Item>

          {(investorFlowReady || startupFlowReady) && (
            <Form.Item
              name="acceptTerms"
              valuePropName="checked"
              rules={[
                {
                  validator: (_, value) =>
                    value
                      ? Promise.resolve()
                      : Promise.reject(new Error("Bạn cần đồng ý với điều khoản trước khi ký")),
                },
              ]}
              style={{ textAlign: "left" }}
            >
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <Checkbox onChange={(e) => setAcceptTermsChecked(e.target.checked)}>
                  Tôi đã đọc toàn bộ hợp đồng và đồng ý với các điều khoản trên.
                </Checkbox>
              </div>
            </Form.Item>
          )}
            </Form>

            {/* Phần hiển thị chữ ký trong form hợp đồng */}
            {/* Logic: 
                - Khi chưa gửi (investor chưa ký): chỉ hiển thị chữ ký investor (cho investor xem)
                - Khi investor đã gửi và startup chưa ký: startup thấy chữ ký investor
                - Khi cả 2 đã ký: hiển thị cả 2 chữ ký
            */}
            {((isInvestor && !investorSigned) || (!isInvestor && investorSigned) || (investorSigned && startupSigned)) && (
              <div style={{ marginTop: 16, borderTop: "1px solid #d9d9d9", padding: "20px 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
                  <SignatureCard
                    label="NHÀ ĐẦU TƯ"
                    signatureHtml={contract?.investorSignatureHtml}
                    personName={contract?.investorName || meeting?.investorFullName || "Nhà đầu tư"}
                    signedAtText={
                      contract?.investorSignedAt
                        ? `Thời gian: ${contract.investorSignedAt}`
                        : "Ngày ... tháng ... năm 20..."
                    }
                    minHeight={120}
                  />

                  {startupSigned && (
                    <SignatureCard
                      label="STARTUP"
                      signatureHtml={contract?.startupSignatureHtml}
                      personName={
                        meeting?.startupFullName ||
                        displayedContract?.startupName ||
                        contract?.startupName ||
                        meeting?.startupName ||
                        "Startup"
                      }
                      signedAtText={
                        contract?.startupSignedAt
                          ? `Thời gian: ${contract.startupSignedAt}`
                          : "Chờ ký"
                      }
                      minHeight={120}
                    />
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {!investorFlowReady && !startupFlowReady && (
          <Paragraph type="secondary" style={{ marginTop: 8 }}>
            {currentStatus === "WAITING_INVESTOR_SIGNATURE" && !isInvestor
              ? "Đang chờ nhà đầu tư hoàn thiện điều khoản."
              : currentStatus === "WAITING_STARTUP_SIGNATURE" && isInvestor
                ? "Đang chờ startup xác nhận hợp đồng."
                : currentStatus === "FULLY_SIGNED"
                  ? "Hợp đồng đã hoàn tất."
                  : "Vui lòng chờ đủ điều kiện để tiếp tục."}
          </Paragraph>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          {/* When viewing contract (read-only), show checkbox + sign button next to Close if startup can sign */}
          {showContractBlock && startupFlowReady && (
            <>
              <Checkbox checked={acceptTermsChecked} onChange={(e) => setAcceptTermsChecked(e.target.checked)} style={{ alignSelf: 'center', marginRight: 'auto' }}>
                Tôi đã đọc toàn bộ hợp đồng và đồng ý với các điều khoản trên.
              </Checkbox>
              <Button type="primary" onClick={handleSignFromView} loading={loading} disabled={!acceptTermsChecked}>
                Ký hợp đồng
              </Button>
            </>
          )}

          <Button onClick={onCancel}>Đóng</Button>

          {!showContractBlock && (
            <>
              {investorFlowReady && (
                <>
                  <Button onClick={handleGeneratePreview} loading={loading} type="default">
                    Xem trước hợp đồng
                  </Button>
                  <Button type="primary" onClick={handleConfirmSend} loading={loading} disabled={disabledSend}>
                    Gửi hợp đồng
                  </Button>
                </>
              )}

              {startupFlowReady && (
                <Button type="primary" onClick={handleConfirmSend} loading={loading}>
                  Ký hợp đồng
                </Button>
              )}
            </>
          )}
        </div>

        <ContractPreviewOverlay
          open={previewModalOpen}
          contractHtml={contractHtml}
          investorSignatureHtml={displayedContract?.investorSignatureHtml}
          investorName={displayedContract?.investorName || meeting?.investorFullName || "Nhà đầu tư"}
          investorSignedAt={displayedContract?.investorSignedAt}
          onClose={() => setPreviewModalOpen(false)}
        />
      </Space>
    </Modal>
  );
};

export default MeetingContractModal;