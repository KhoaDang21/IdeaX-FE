import type { FC, ChangeEvent, FormEvent } from 'react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/images/541447718_1863458311190035_8212706485109580334_n.jpg';
import { ThunderboltOutlined, DollarOutlined, SafetyOutlined, EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import { loginUser, getStartupProfile } from '../services/features/auth/authSlice';
import { App } from 'antd';

const Input: FC<{ label: string; type?: string; placeholder?: string; rightIcon?: React.ReactNode; onRightIconClick?: () => void; color?: string; value?: string; onChange?: (e: ChangeEvent<HTMLInputElement>) => void; error?: string }> = ({ label, type = 'text', placeholder, rightIcon, onRightIconClick, color = '#34419A', value, onChange, error }) => {
    return (
        <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', color, fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{label}</label>
            <div style={{ position: 'relative' }}>
                <input
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    style={{
                        width: '100%',
                        padding: '12px 14px',
                        paddingRight: rightIcon ? 38 : 14,
                        border: `1px solid ${error ? '#ef4444' : color}`,
                        borderRadius: 10,
                        outline: 'none',
                        color
                    }}
                />
                {rightIcon && (
                    <button type="button" onClick={onRightIconClick} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: '#64748b', border: 0, background: 'transparent', cursor: 'pointer', padding: 4 }} aria-label="toggle password visibility">
                        {rightIcon}
                    </button>
                )}
            </div>
            {error && <div style={{ color: '#ef4444', fontSize: 12, marginTop: 6 }}>{error}</div>}
        </div>
    )
}

const Login: FC = () => {
    const { message } = App.useApp();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    type RootState = { auth: { loading: boolean; user?: { role?: string; id?: string } } };
    const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;
    const dispatch = useDispatch();
    const loading = useTypedSelector(state => state.auth.loading);
    const user = useTypedSelector(state => state.auth.user);
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateEmail = (email: string) => {
        return /^\S+@\S+\.\S+$/.test(email);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        let newErrors: Record<string, string> = {};
        if (!email.trim()) newErrors.email = 'Vui lòng nhập email';
        else if (!validateEmail(email)) newErrors.email = 'Email không hợp lệ';
        if (!password.trim()) newErrors.password = 'Vui lòng nhập mật khẩu';
        else if (password.length < 6) newErrors.password = 'Mật khẩu tối thiểu 6 ký tự';
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
            message.error('Vui lòng điền đầy đủ và đúng thông tin các trường bắt buộc.');
            return;
        }
        setSubmitting(true);
        message.loading({ content: 'Đang đăng nhập...', key: 'login', duration: 0 });
        (dispatch(loginUser({ email, password }) as any))
            .unwrap()
            .then(() => {
                message.success({ content: 'Đăng nhập thành công!', key: 'login' });
            })
            .catch(() => {
                message.error({ content: 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.', key: 'login' });
            })
            .finally(() => setSubmitting(false));
    };

    // Redirect based on role after successful login
    useEffect(() => {
        if (!user) return;
        if (user.role === 'startup') {
            if (user.id) {
                (dispatch(getStartupProfile(user.id) as any));
            }
            navigate('/startup/dashboard');
        } else if (user.role === 'investor') {
            navigate('/investor/find-projects');
        } else if (user.role === 'admin') {
            navigate('/admin/user-management');
        }
    }, [user, navigate, dispatch]);
    return (
        <main>
            <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '100vh' }}>
                {/* Left - form */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
                    <div style={{ width: '100%', maxWidth: 420 }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                            <img src={logo} alt="IdeaX" style={{ width: 56, height: 56, borderRadius: 12, objectFit: 'cover' }} />
                        </div>
                        <h1 style={{ textAlign: 'center', margin: '0 0 6px', color: '#34419A' }}>Welcome Back</h1>
                        <p style={{ textAlign: 'center', margin: '0 0 24px', color: '#64748b' }}>Sign in to your account</p>

                        <form onSubmit={handleSubmit}>
                            <Input label="Email Address" type="email" placeholder="Enter your email address" color="#34419A" value={email} onChange={e => setEmail(e.target.value)} error={(errors as any).email} />
                            <Input label="Password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" rightIcon={showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />} onRightIconClick={() => setShowPassword((v) => !v)} color="#34419A" value={password} onChange={e => setPassword(e.target.value)} error={(errors as any).password} />

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#475569', fontSize: 14 }}>
                                    <input type="checkbox" /> Remember me
                                </label>
                                <Link to="#" style={{ color: '#4f46e5', fontSize: 14, textDecoration: 'none' }}>Forgot your password?</Link>
                            </div>

                            <button type="submit" disabled={loading || submitting} style={{ width: '100%', padding: '12px 16px', background: '#34419A', color: '#fff', border: 0, borderRadius: 10, cursor: 'pointer', marginTop: 6 }}>{loading || submitting ? 'Đang nhập...' : 'Sign In'}</button>
                        </form>

                        <p style={{ textAlign: 'center', margin: '16px 0', color: '#64748b', fontSize: 14 }}>Or continue with</p>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 8,
                                    padding: '10px 16px',
                                    width: '100%',
                                    borderRadius: 10,
                                    border: '1px solid #e2e8f0',
                                    background: '#fff',
                                    cursor: 'pointer'
                                }}
                            >
                                <img
                                    src="https://www.svgrepo.com/show/355037/google.svg"
                                    alt="Google logo"
                                    style={{ width: 20, height: 20 }}
                                />
                                <span>Google</span>
                            </button>
                        </div>

                        <p style={{ textAlign: 'center', marginTop: 14, color: '#64748b', fontSize: 14 }}>Don't have an account? <Link to="/start" style={{ color: '#4f46e5', textDecoration: 'none' }}>Sign up for free</Link></p>
                        <p style={{ textAlign: 'center', marginTop: 8 }}>
                            <Link to="/" style={{ color: '#64748b', textDecoration: 'none' }}>← Back to Home</Link>
                        </p>
                    </div>
                </div>

                {/* Right - marketing */}
                <div style={{ background: 'linear-gradient(135deg,#34419A,#3FC7F4)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                    <div style={{ width: '100%', maxWidth: 520 }}>
                        <h2 style={{ marginTop: 0, fontSize: 40, lineHeight: 1.2 }}>Connect. Invest. Grow.</h2>
                        <p style={{ marginTop: 8, opacity: 0.95 }}>Join thousands of successful startups and investors building the future together.</p>

                        <div style={{ display: 'grid', gap: 14, marginTop: 24 }}>
                            <div style={{ background: '#ffffff', color: '#0f172a', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                                <span style={{ width: 34, height: 34, borderRadius: 8, background: '#e2e8f0', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#111827' }}>
                                    <ThunderboltOutlined />
                                </span>
                                <div>
                                    <div style={{ fontWeight: 700 }}>For Startups</div>
                                    <div style={{ color: '#475569', fontSize: 14 }}>Secure funding faster</div>
                                </div>
                            </div>
                            <div style={{ background: '#ffffff', color: '#0f172a', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                                <span style={{ width: 34, height: 34, borderRadius: 8, background: '#e2e8f0', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#111827' }}>
                                    <DollarOutlined />
                                </span>
                                <div>
                                    <div style={{ fontWeight: 700 }}>For Investors</div>
                                    <div style={{ color: '#475569', fontSize: 14 }}>Discover opportunities</div>
                                </div>
                            </div>
                            <div style={{ background: '#ffffff', color: '#0f172a', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                                <span style={{ width: 34, height: 34, borderRadius: 8, background: '#e2e8f0', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#111827' }}>
                                    <SafetyOutlined />
                                </span>
                                <div>
                                    <div style={{ fontWeight: 700 }}>Secure Platform</div>
                                    <div style={{ color: '#475569', fontSize: 14 }}>Enterprise-grade security</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}

export default Login