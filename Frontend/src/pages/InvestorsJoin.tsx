import type { FC, ChangeEvent } from 'react';
import { App } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { DollarOutlined, ThunderboltOutlined, EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { useState } from 'react';
import logo from '../assets/images/541447718_1863458311190035_8212706485109580334_n.jpg';
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import { registerInvestor } from '../services/features/auth/authSlice';

type InputProps = { label: string; placeholder?: string; type?: string; rightIcon?: React.ReactNode; onRightIconClick?: () => void; value?: string; onChange?: (e: ChangeEvent<HTMLInputElement>) => void; error?: string };
const Input: FC<InputProps> = ({ label, placeholder, type = 'text', rightIcon, onRightIconClick, value, onChange, error }) => (
    <div style={{ marginBottom: 14 }}>
        <label style={{ display: 'block', color: '#34419A', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>{label}</label>
        <div style={{ position: 'relative' }}>
            <input type={type} placeholder={placeholder} value={value} onChange={onChange} style={{ width: '100%', padding: '10px 12px', paddingRight: rightIcon ? 36 : 12, border: `1px solid ${error ? '#ef4444' : '#34419A'}`, borderRadius: 10, outline: 'none', color: '#34419A' }} />
            {rightIcon && (
                <button type="button" onClick={onRightIconClick} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 0, cursor: 'pointer', color: '#64748b' }}>{rightIcon}</button>
            )}
        </div>
        {error && <div style={{ color: '#ef4444', fontSize: 12, marginTop: 6 }}>{error}</div>}
    </div>
);

type SelectProps = { label: string; placeholder?: string; options: string[]; value?: string; onChange?: (e: ChangeEvent<HTMLSelectElement>) => void };
const Select: FC<SelectProps> = ({ label, placeholder, options, value, onChange }) => (
    <div style={{ marginBottom: 14 }}>
        <label style={{ display: 'block', color: '#34419A', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>{label}</label>
        <select
            value={value}
            onChange={onChange}
            style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #34419A',
                borderRadius: 10,
                outline: 'none',
                background: '#fff',
                color: '#34419A',
            }}
        >
            <option value="" disabled hidden style={{ color: '#94a3b8' }}>{placeholder}</option>
            {options.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
            ))}
        </select>
    </div>
);

const Bullet: FC<{ children: React.ReactNode }> = ({ children }) => (
    <li style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#334155' }}>
        <span style={{ color: '#16a34a' }}>✓</span>
        <span>{children}</span>
    </li>
);

const InvestorsJoin: FC = () => {
    const { message } = App.useApp();
    const [showPwd, setShowPwd] = useState(false);
    const [showPwd2, setShowPwd2] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [organization, setOrganization] = useState('');
    const [investmentFocus, setInvestmentFocus] = useState('');
    const [investmentRange, setInvestmentRange] = useState('');
    const [investmentExperience, setInvestmentExperience] = useState('');
    // Define RootState for type safety
    type RootState = { auth: { loading: boolean } };
    const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;
    const dispatch = useDispatch();
    // using local `submitting` to control submit state; global loading is not used here
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateEmail = (value: string) => {
        const email = (value || '').trim();
        return /^\S+@\S+\.\S+$/.test(email);
    };

    // Clear a specific field error when user types
    const onChangeField = (setter: (v: string) => void, field?: string) => (e: ChangeEvent<HTMLInputElement>) => {
        if (field) setErrors(prev => {
            const copy = { ...prev };
            delete (copy as any)[field];
            return copy;
        });
        setter(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        let newErrors: Record<string, string> = {};
        const trimmed = {
            email: email.trim(),
            fullName: fullName.trim(),
        };

        if (!trimmed.fullName) newErrors.fullName = 'Vui lòng nhập họ tên';
        if (!trimmed.email) newErrors.email = 'Vui lòng nhập email';
        else if (!validateEmail(trimmed.email)) newErrors.email = 'Email không hợp lệ';
        if (!password) newErrors.password = 'Vui lòng nhập mật khẩu';
        else if (password.length < 6) newErrors.password = 'Mật khẩu tối thiểu 6 ký tự';
        if (!confirmPassword) newErrors.confirmPassword = 'Vui lòng nhập xác nhận mật khẩu';
        else if (password !== confirmPassword) newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        // Validate các field optional nhưng vẫn báo nếu trống (nếu muốn bắt buộc)
        // if (!organization.trim()) newErrors.organization = 'Vui lòng nhập tổ chức';
        // if (!investmentFocus.trim()) newErrors.investmentFocus = 'Vui lòng chọn lĩnh vực đầu tư';
        // if (!investmentRange.trim()) newErrors.investmentRange = 'Vui lòng chọn khoảng đầu tư';
        // if (!investmentExperience.trim()) newErrors.investmentExperience = 'Vui lòng nhập kinh nghiệm đầu tư';

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
            message.error('Vui lòng điền đầy đủ và đúng thông tin các trường bắt buộc.');
            return;
        }
        setSubmitting(true);
        message.loading({ content: 'Đang tạo tài khoản...', key: 'register', duration: 0 });
        try {
            await (dispatch as any)(registerInvestor({
                email: trimmed.email,
                password,
                confirmPassword,
                fullName: trimmed.fullName,
                organization,
                investmentFocus,
                investmentRange,
                investmentExperience
            })).unwrap();
            message.success({ content: 'Tạo tài khoản thành công! Vui lòng đăng nhập.', key: 'register' });
            setTimeout(() => navigate('/login'), 1200);
        } catch (err: any) {
            // unwrap() rejection may be an object with payload or message
            const serverMsg = err?.payload?.message || err?.message || err?.response?.data?.message || String(err);
            const serverErrors: Record<string, string> = {};
            if (/email|already|exists|đã tồn tại/i.test(serverMsg)) {
                serverErrors.email = serverMsg;
            } else if (/password|mật khẩu/i.test(serverMsg)) {
                serverErrors.password = serverMsg;
            } else if (/confirm|khớp|match/i.test(serverMsg)) {
                serverErrors.confirmPassword = serverMsg;
            }
            if (Object.keys(serverErrors).length) {
                setErrors(prev => ({ ...prev, ...serverErrors }));
                // replace loading message with field error so spinner/toast stops
                message.error({ content: serverMsg || 'Tạo tài khoản thất bại', key: 'register' });
            } else {
                message.error({ content: serverMsg || 'Tạo tài khoản thất bại. Vui lòng thử lại.', key: 'register' });
            }
        } finally {
            setSubmitting(false);
        }
    };


    return (
        <main>
            <header style={{ background: '#fff', borderBottom: '1px solid #eef2f7' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                        <img src={logo} alt="IdeaX" style={{ width: 28, height: 28, borderRadius: 8, objectFit: 'cover' }} />
                        <strong style={{ color: '#0f172a' }}>IdeaX</strong>
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ color: '#64748b', fontSize: 14 }}>Already have an account?</span>
                        <Link to="/login" style={{ color: '#34419A', textDecoration: 'none', fontWeight: 600 }}>Login</Link>
                    </div>
                </div>
            </header>

            <section style={{ padding: '32px 16px' }}>
                <div style={{ maxWidth: 1120, margin: '0 auto' }}>
                    <h1 style={{ textAlign: 'center', margin: 0, color: '#34419A' }}>Join</h1>
                    <p style={{ textAlign: 'center', color: '#64748b', margin: '8px 0 22px' }}>Choose your path and start connecting with the right partners to grow your business or investment portfolio.</p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
                        {/* Left card - startup summary */}
                        <div onClick={() => navigate('/start')} style={{ background: '#f8fafc', borderRadius: 16, padding: 18, border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(15,23,42,0.06)', cursor: 'pointer' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                                <span style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#60a5fa,#22d3ee)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <ThunderboltOutlined />
                                </span>
                                <div>
                                    <div style={{ color: '#0f172a', fontWeight: 800 }}>For Startups</div>
                                    <div style={{ color: '#64748b', fontSize: 13 }}>Showcase your innovation</div>
                                </div>
                                <div style={{ marginLeft: 'auto', width: 16, height: 16, borderRadius: '50%', border: '3px solid #94a3b8', background: '#fff' }} />
                            </div>
                            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 12px', display: 'grid', gap: 6 }}>
                                <Bullet>Create compelling project profiles</Bullet>
                                <Bullet>Connect with verified investors</Bullet>
                                <Bullet>Secure funding through our platform</Bullet>
                                <Bullet>Access mentorship and resources</Bullet>
                            </ul>
                            {/* Click card to switch */}
                        </div>

                        {/* Right card - active investor form */}
                        <div style={{ background: '#fff', borderRadius: 16, padding: 18, border: '2px solid #3FC7F4', boxShadow: '0 10px 30px rgba(2,132,199,0.15)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                                <span style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#3FC7F4,#34419A)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <DollarOutlined />
                                </span>
                                <div>
                                    <div style={{ color: '#0f172a', fontWeight: 800 }}>For Investors</div>
                                    <div style={{ color: '#64748b', fontSize: 13 }}>Discover opportunities</div>
                                </div>
                                <div style={{ marginLeft: 'auto', width: 16, height: 16, borderRadius: '50%', border: '3px solid #3FC7F4', background: '#3FC7F4' }} />
                            </div>
                            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 14px', display: 'grid', gap: 6 }}>
                                <Bullet>Access curated startup pipeline</Bullet>
                                <Bullet>Comprehensive due diligence tools</Bullet>
                                <Bullet>Portfolio management dashboard</Bullet>
                                <Bullet>Direct communication with founders</Bullet>
                            </ul>

                            <form style={{ marginTop: 8 }} onSubmit={handleSubmit}>
                                <Input label="Full Name *" placeholder="Enter your full name" value={fullName} onChange={onChangeField(setFullName, 'fullName')} error={errors.fullName} />
                                <Input label="Investment Firm/Organization" placeholder="Enter your firm or organization name" value={organization} onChange={onChangeField(setOrganization)} />
                                <Input label="Email Address *" type="email" placeholder="Enter your email address" value={email} onChange={onChangeField(setEmail, 'email')} error={errors.email} />
                                <Select label="Investment Focus" placeholder="Select investment focus" options={[
                                    'Technology & Software',
                                    'Healthcare & Biotech',
                                    'Fintech & Financial Services',
                                    'E-commerce & Retail',
                                    'Education & EdTech',
                                    'Real Estate & PropTech',
                                    'Energy & CleanTech',
                                    'Manufacturing & Industrial',
                                    'Media & Entertainment',
                                    'Transportation & Logistics',
                                    'Agriculture & FoodTech',
                                    'Other'
                                ]} value={investmentFocus} onChange={e => setInvestmentFocus(e.target.value)} />
                                <Select label="Investment Range" placeholder="Select investment range" options={[
                                    '$10K - $50K',
                                    '$50K - $100K',
                                    '$100K - $250K',
                                    '$250K - $500K',
                                    '$500K - $1M',
                                    '$1M - $2.5M',
                                    '$2.5M - $5M',
                                    '$5M - $10M',
                                    '$10M+'
                                ]} value={investmentRange} onChange={e => setInvestmentRange(e.target.value)} />
                                <Input label="Investment Experience" placeholder="Enter your investment experience" value={investmentExperience} onChange={e => setInvestmentExperience(e.target.value)} />
                                <Input label="Password *" type={showPwd ? 'text' : 'password'} placeholder="Create a password" rightIcon={showPwd ? <EyeInvisibleOutlined /> : <EyeOutlined />} onRightIconClick={() => setShowPwd((v) => !v)} value={password} onChange={onChangeField(setPassword, 'password')} error={errors.password} />
                                <Input label="Confirm Password *" type={showPwd2 ? 'text' : 'password'} placeholder="Confirm your password" rightIcon={showPwd2 ? <EyeInvisibleOutlined /> : <EyeOutlined />} onRightIconClick={() => setShowPwd2((v) => !v)} value={confirmPassword} onChange={onChangeField(setConfirmPassword, 'confirmPassword')} error={errors.confirmPassword} />
                                <button type="submit" disabled={submitting} style={{ width: '100%', padding: '12px 16px', background: '#34419A', color: '#fff', border: 0, borderRadius: 10, cursor: 'pointer', marginTop: 6 }}>{submitting ? 'Đang tạo...' : 'Create Investor Account'}</button>
                            </form>
                        </div>
                    </div>

                    <p style={{ textAlign: 'center', marginTop: 16, color: '#64748b', fontSize: 12 }}>By creating an account, you agree to our <a href="#" style={{ color: '#34419A', textDecoration: 'none' }}>Terms of Service</a> and <a href="#" style={{ color: '#34419A', textDecoration: 'none' }}>Privacy Policy</a></p>
                </div>
            </section>
        </main>
    )
}

export default InvestorsJoin


