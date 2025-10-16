import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '../../store'
import { getInvestorProfile, updateInvestorProfile } from '../../services/features/auth/authSlice'
import { App } from 'antd'

const countryOptions = [
    'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Aruba', 'Australia', 'Austria', 'Azerbaijan',
    'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi',
    'Côte d\'Ivoire', 'Cabo Verde', 'Cambodia', 'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Costa Rica', 'Croatia', 'Cuba', 'Curaçao', 'Cyprus', 'Czechia',
    'Democratic Republic of the Congo', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia',
    'Federated States of Micronesia', 'Fiji', 'Finland', 'France', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana',
    'Haiti', 'Honduras', 'Hong Kong', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kosovo', 'Kuwait', 'Kyrgyzstan',
    'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Macau', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar',
    'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway', 'Oman', 'Pakistan', 'Palau', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar',
    'Republic of the Congo', 'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria',
    'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
]

const ProfileInvestor: React.FC = () => {
    const dispatch = useDispatch()
    const { message } = App.useApp()
    const user = useSelector((state: RootState) => state.auth.user)
    const loading = useSelector((state: RootState) => state.auth.loading)

    const [form, setForm] = useState({
        fullName: '',
        phoneNumber: '',
        country: '',
        linkedInUrl: '',
        twoFactorEnabled: false,
        organization: '',
    })

    useEffect(() => {
        if (user?.role === 'investor' && user.id) {
            (dispatch(getInvestorProfile(user.id) as any))
        }
    }, [user?.id])

    useEffect(() => {
        if (!user) return
        setForm({
            fullName: user.fullName || '',
            phoneNumber: user.phoneNumber || '',
            country: (user as any).country || '',
            linkedInUrl: (user as any).linkedInUrl || '',
            twoFactorEnabled: (user as any).twoFactorEnabled || false,
            organization: (user as any).organization || ''
        })
    }, [user])

    const onChange = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const value = (e.target as HTMLInputElement).type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value
        setForm(prev => ({ ...prev, [key]: value }))
    }

    // Immediate toggle for 2FA: call API to persist change for better UX
    const onToggle2FA = async (checked: boolean) => {
        if (!user?.id) return
        message.loading({ content: 'Updating security...', key: 'investor-profile-2fa', duration: 0 })
        try {
            await (dispatch(updateInvestorProfile({ accountId: user.id, profileData: { twoFactorEnabled: checked } }) as any)).unwrap()
            setForm(prev => ({ ...prev, twoFactorEnabled: checked }))
            message.success({ content: 'Security updated', key: 'investor-profile-2fa' })
        } catch (err: any) {
            message.error({ content: err?.message || 'Update failed', key: 'investor-profile-2fa' })
        }
    }

    const onSave = () => {
        if (!user?.id) return
        message.loading({ content: 'Saving...', key: 'investor-profile', duration: 0 })
            ; (dispatch(updateInvestorProfile({
                accountId: user.id, profileData: {
                    fullName: form.fullName,
                    phoneNumber: form.phoneNumber || undefined,
                    linkedInUrl: form.linkedInUrl || undefined,
                    country: form.country || undefined,
                    twoFactorEnabled: form.twoFactorEnabled || undefined,
                }
            }) as any)).unwrap()
                .then(() => {
                    if (user?.id) (dispatch(getInvestorProfile(user.id) as any))
                    // Backend now owns the country value; the getInvestorProfile call will update state.user
                    message.success({ content: 'Saved successfully', key: 'investor-profile' })
                })
                .catch((err: any) => {
                    message.error({ content: err?.message || 'Save failed', key: 'investor-profile' })
                })
    }

    return (
        <div style={{ padding: 32, background: '#f9fafb', minHeight: '100vh' }}>
            <div style={{ maxWidth: '1400px', width: 'calc(100% - 64px)', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Header / Title */}
                <div>
                    <h2 style={{ margin: 0, color: '#27348B' }}>INVESTOR – PROFILE</h2>
                    <div style={{ color: '#6b7280', marginTop: 6 }}>Manage your personal and account information</div>
                </div>

                {/* Profile Summary */}
                <div style={{ background: '#fff', padding: 20, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', gap: 12, flex: 1 }}>
                            <SummaryCard title={user?.fullName || user?.email || '—'} subtitle='Full Name' />
                            <SummaryCard title={user?.email || '—'} subtitle='Email' />
                            <SummaryCard title={user?.phoneNumber || '—'} subtitle='Phone Number' />
                            <SummaryCard title={'Investor'} subtitle='Account Type' />
                            <SummaryCard title={(user as any)?.country || '—'} subtitle='Country' />
                        </div>
                    </div>
                </div>

                {/* Main content */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
                    {/* Left: Personal Details */}
                    <div style={{ background: '#fff', padding: 18, borderRadius: 12, minHeight: 260 }}>
                        <h3 style={{ marginTop: 0, color: '#27348B' }}>Personal Details</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <input placeholder='Full Name' value={form.fullName} onChange={onChange('fullName')} style={inputStyle} />
                            <input placeholder='Email' value={user?.email || ''} disabled style={{ ...inputStyle, background: '#f3f4f6' }} />
                            <input placeholder='Phone Number' value={form.phoneNumber} onChange={onChange('phoneNumber')} style={inputStyle} />
                            <select value={form.country} onChange={onChange('country')} style={{ ...inputStyle, padding: 10 }}>
                                <option value=''>Select country</option>
                                {countryOptions.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <input placeholder='LinkedIn URL' value={form.linkedInUrl} onChange={onChange('linkedInUrl')} style={inputStyle} />
                            <input placeholder='Organization' value={form.organization} disabled style={{ ...inputStyle, background: '#f3f4f6' }} />
                        </div>
                    </div>

                    {/* Right: Security Settings */}
                    <div style={{ background: '#fff', padding: 18, borderRadius: 12, minHeight: 260 }}>
                        <h3 style={{ marginTop: 0, color: '#27348B' }}>Security Settings</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div>
                                <div style={{ color: '#6b7280', fontSize: 13 }}>Password</div>
                                <div style={{ marginTop: 8 }}>
                                    <button style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #e6e6f0', background: '#fff' }}>Change Password</button>
                                </div>
                            </div>

                            <div>
                                <div style={{ color: '#6b7280', fontSize: 13 }}>Two-Factor Authentication</div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                                    <input type='checkbox' checked={form.twoFactorEnabled} onChange={(e) => onToggle2FA(e.target.checked)} />
                                    <span style={{ color: '#374151' }}>Enable 2FA for enhanced security</span>
                                </label>
                            </div>

                            <div style={{ color: '#6b7280', fontSize: 13 }}>
                                <div>Last Login</div>
                                <div style={{ marginTop: 6, color: '#374151' }}>—</div>
                            </div>

                            <div>
                                <button style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #e6e6f0', background: '#fff' }}>Download Login History</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Account Actions */}
                <div style={{ background: '#fff', padding: 18, borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <button style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #e6e6f0', background: '#fff' }}>Contact Support</button>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button onClick={onSave} disabled={loading} style={{ padding: '10px 16px', borderRadius: 8, background: '#27348B', color: '#fff', border: 'none' }}>{loading ? 'Saving...' : 'Save Changes'}</button>
                        <button style={{ padding: '10px 16px', borderRadius: 8, background: '#fff', color: '#ef4444', border: '1px solid #fee2e2' }}>Request Account Deletion</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

const SummaryCard: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => (
    <div style={{ flex: 1, background: '#f8fafc', borderRadius: 10, padding: 12, textAlign: 'center' }}>
        <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>{title}</div>
        <div style={{ color: '#6b7280', fontSize: 12 }}>{subtitle}</div>
    </div>
)

const inputStyle: React.CSSProperties = {
    padding: 10,
    borderRadius: 8,
    border: '1px solid #e6e6f0',
    outline: 'none',
    width: '100%'
}

export default ProfileInvestor