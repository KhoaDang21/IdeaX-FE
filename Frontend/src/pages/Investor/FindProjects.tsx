import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllProjects } from '../../services/features/project/projectSlice';
import type { RootState, AppDispatch } from '../../store';
import type { Project } from '../../interfaces/project';
import { Card, Button, Tag, Progress, Typography, Row, Col, Modal, Select, Space } from 'antd';
import { EyeOutlined, FilterOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const FindProjects: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { projects, status, error } = useSelector((state: RootState) => state.project);
    const [filter, setFilter] = useState('all');
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [detailVisible, setDetailVisible] = useState<boolean>(false);

    useEffect(() => {
        dispatch(getAllProjects());
    }, [dispatch]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const getCategoryTagColor = (category: string) => {
        const colors: { [key: string]: string } = {
            'AI': 'purple',
            'AI_ML': 'purple',
            'WEB3': 'geekblue',
            'CLEANTECH': 'green',
            'GREEN_TECH': 'green',
            'EDTECH': 'orange',
            'EDUCATION': 'orange',
            'HEALTHTECH': 'red',
            'HEALTHCARE': 'red',
            'IOT': 'cyan',
            'FINTECH': 'blue',
            'ENERGY': 'volcano',
            'MOBILE': 'magenta',
            'HARDWARE': 'gray',
            'ENTERPRISE': 'purple',
            'ECOMMERCE': 'pink',
            'BLOCKCHAIN': 'geekblue',
            'AGRICULTURE': 'lime',
        };
        return colors[category] || 'default';
    };

    const formatFundingStage = (stage: string) => {
        if (!stage) return 'Unknown';
        return stage.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    };

    const filteredProjects = filter === 'all'
        ? projects
        : projects.filter(project => project.category === filter);

    const categories = ['all', ...Array.from(new Set(projects.map(p => p.category)))];

    // Get funding data based on fundingRange from the project - FIXED LOGIC
    const getFundingData = (project: Project) => {
        // If project has actual funding data, use it
        if (project.currentFunding !== undefined && project.fundingGoal !== undefined) {
            return {
                current: project.currentFunding,
                goal: project.fundingGoal
            };
        }

        // Define realistic funding ranges based on funding stage and range
        const fundingRanges: { [key: string]: { current: number, goal: number } } = {
            'UNDER_50K': { current: 25000, goal: 50000 },
            'FROM_50K_TO_200K': { current: 100000, goal: 200000 },
            'FROM_200K_TO_1M': { current: 500000, goal: 1000000 },
            'OVER_1M': { current: 750000, goal: 2000000 }, // Realistic for Series A
        };

        // Use the project's fundingRange if available
        const rangeData = fundingRanges[project.fundingRange] || { current: 225000, goal: 750000 };

        // Adjust based on funding stage for more realism
        if (project.fundingStage === 'SEED') {
            return { current: Math.round(rangeData.current * 0.3), goal: Math.round(rangeData.goal * 0.5) };
        } else if (project.fundingStage === 'SERIES_B') {
            return { current: Math.round(rangeData.current * 2), goal: Math.round(rangeData.goal * 3) };
        } else if (project.fundingStage === 'SERIES_C') {
            return { current: Math.round(rangeData.current * 5), goal: Math.round(rangeData.goal * 8) };
        }

        return rangeData;
    };

    // Get company name - FIXED: Use project data first
    const getCompanyName = (project: Project) => {
        // If project has company name, use it
        if (project.companyName) return project.companyName;

        const companyNames: { [key: string]: string } = {
            'AI': 'TechStart Inc.',
            'AI_ML': 'TechStart Inc.',
            'CLEANTECH': 'EcoTech Corp',
            'GREEN_TECH': 'EcoTech Corp',
            'HEALTHTECH': 'MedInnovate',
            'HEALTHCARE': 'MedInnovate',
            'EDTECH': 'EduNext Solutions',
            'EDUCATION': 'EduNext Solutions',
            'WEB3': 'CryptoFlow Systems',
            'IOT': 'ConnectHome Tech',
            'FINTECH': 'FinTech Solutions',
            'ECOMMERCE': 'ShopNext',
            'BLOCKCHAIN': 'BlockChain Innovations',
            'AGRICULTURE': 'AgriTech Solutions',
            'ENTERPRISE': 'Enterprise Solutions Inc.',
        };
        return companyNames[project.category] || `${project.projectName} Inc.` || 'Tech Company';
    };

    // Get description - FIXED: Use project description first
    const getProjectDescription = (project: Project) => {
        if (project.description && project.description.trim().length > 0) {
            return project.description;
        }

        const descriptions: { [key: string]: string } = {
            'AI': 'Revolutionary analytics platform using machine learning to provide real-time business insights and predictive analytics for enterprise clients.',
            'AI_ML': 'Revolutionary analytics platform using machine learning to provide real-time business insights and predictive analytics for enterprise clients.',
            'WEB3': 'Next-generation payment processing platform with blockchain integration and smart contract automation.',
            'CLEANTECH': 'Sustainable energy solutions for urban environments using advanced solar and wind integration technologies.',
            'GREEN_TECH': 'Sustainable energy solutions for urban environments using advanced solar and wind integration technologies.',
            'EDTECH': 'Personalized learning platform using adaptive AI to customize educational content for individual student needs.',
            'EDUCATION': 'Personalized learning platform using adaptive AI to customize educational content for individual student needs.',
            'HEALTHTECH': 'Mobile health monitoring app with AI-driven diagnostics and telemedicine features for remote patient care.',
            'HEALTHCARE': 'Mobile health monitoring app with AI-driven diagnostics and telemedicine features for remote patient care.',
            'IOT': 'Comprehensive smart home automation system with advanced IoT integration and voice control capabilities.',
            'FINTECH': 'Innovative financial technology solutions for modern banking and payment systems.',
            'ECOMMERCE': 'Next-generation e-commerce platform with AI-powered recommendations and seamless user experience.',
            'BLOCKCHAIN': 'Decentralized solutions leveraging blockchain technology for secure and transparent transactions.',
            'AGRICULTURE': 'Advanced agricultural technology solutions for sustainable farming and food production.',
            'ENTERPRISE': 'Enterprise-grade solutions for business transformation and digital innovation.',
        };
        return descriptions[project.category] || 'Innovative solution transforming the industry with cutting-edge technology and sustainable practices.';
    };

    // Safe number conversion for team size
    const getTeamSize = (project: Project): number => {
        if (project.teamSize) {
            const size = parseInt(project.teamSize.toString());
            return isNaN(size) ? 8 : Math.max(1, size);
        }
        return 8;
    };

    // Safe URL handling
    const getWebsiteUrl = (project: Project): string => {
        if (project.website) {
            return project.website.startsWith('http') ? project.website : `https://${project.website}`;
        }
        return '#';
    };

    // Format category for display
    const formatCategory = (category: string): string => {
        if (!category) return 'Other';
        return category.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    };

    if (status === 'loading') {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600 font-medium">Loading projects...</p>
            </div>
        );
    }

    if (status === 'failed') {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md w-full">
                    <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h2 className="text-2xl font-bold text-red-700 mb-3 text-center">Error Loading Projects</h2>
                    <p className="text-gray-700 text-center mb-6">{error || "There was a problem loading projects. Please try again later."}</p>
                    <button
                        onClick={() => dispatch(getAllProjects())}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-6">
            <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header with Filter and Count */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 w-full">
                    {/* Left side */}
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold mb-2" style={{ color: '#34419A' }}>
                            Discover Investment Opportunities
                        </h1>
                        <p className="text-lg text-gray-600 max-w-3xl">
                            Browse and connect with innovative startups seeking funding across various industries
                        </p>
                    </div>

                    {/* Right side */}
                    <div className="flex flex-col md:items-end items-start gap-2 md:ml-auto">
                        <div className="flex items-center gap-3 w-full md:w-auto justify-start md:justify-end">
                            <FilterOutlined className="text-gray-500 text-lg" />
                            <Select
                                value={filter}
                                onChange={setFilter}
                                style={{ width: 200 }}
                                size="large"
                                placeholder="Filter by category"
                                className="filter-select"
                            >
                                <Option value="all">All Categories</Option>
                                {categories.filter(cat => cat !== 'all').map((category) => (
                                    <Option key={category} value={category}>
                                        {formatCategory(category)}
                                    </Option>
                                ))}
                            </Select>
                        </div>

                        <Text className="text-gray-600 text-sm md:text-right">
                            Showing <span className="font-semibold">{filteredProjects.length}</span> projects
                            {filter !== 'all' && (
                                <span> in <span className="font-semibold">{formatCategory(filter)}</span></span>
                            )}
                        </Text>
                    </div>
                </div>

                {/* Projects Grid */}
                <Row gutter={[20, 20]}>
                    {filteredProjects.map((project: Project) => {
                        const fundingData = getFundingData(project);
                        const progressPercentage = Math.min(100, (fundingData.current / fundingData.goal) * 100);
                        const companyName = getCompanyName(project);
                        const description = getProjectDescription(project);
                        const teamSize = getTeamSize(project);

                        return (
                            <Col xs={24} sm={12} md={12} lg={8} key={project.id}>
                                <Card
                                    hoverable
                                    className="h-full rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden bg-white border border-[#E2E8F0]"
                                    bodyStyle={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        padding: '20px',
                                        width: '100%',
                                    }}
                                >
                                    {/* Card Content */}
                                    <div className="flex flex-col h-full space-y-4">
                                        {/* Project Header */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-start gap-2">
                                                <div className="flex-1">
                                                    <Title level={4} className="m-0 text-gray-900 line-clamp-2 flex-1 text-lg leading-snug">
                                                        {project.projectName || 'Unnamed Project'}
                                                    </Title>
                                                    <Text type="secondary" className="text-sm font-medium block text-gray-600 mt-1">
                                                        {companyName}
                                                    </Text>
                                                </div>

                                                <div className="flex flex-col items-end gap-2">
                                                    <Tag color={project.status === 'APPROVED' ? 'green' : 'gold'} className="text-xs px-3 py-1 font-medium">
                                                        {project.status === 'APPROVED' ? 'Open Access' : 'NDA Required'}
                                                    </Tag>
                                                    <Tag
                                                        color={getCategoryTagColor(project.category)}
                                                        className="flex-shrink-0 text-xs px-3 py-1 font-medium"
                                                    >
                                                        {formatCategory(project.category)}
                                                    </Tag>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <Paragraph
                                            ellipsis={{ rows: 3 }}
                                            className="text-gray-600 flex-grow leading-relaxed text-sm mt-2 mb-2"
                                        >
                                            {description}
                                        </Paragraph>

                                        {/* Funding Stage Tag */}
                                        <div className="mt-1 mb-2">
                                            <Tag color="blue" className="text-xs px-3 py-1 font-medium">
                                                {project.fundingStage ? formatFundingStage(project.fundingStage) : 'Seed'} Stage
                                            </Tag>
                                        </div>

                                        {/* Funding & Info Section - Two Columns Layout */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-4 w-full bg-gray-50 rounded-lg border border-gray-200 p-5">
                                            {/* Left: Funding Progress */}
                                            <div className="flex flex-col w-full">
                                                {/* Sửa đoạn này */}
                                                <div className="flex justify-between items-center mb-2 w-full px-2">
                                                    <Text
                                                        type="secondary"
                                                        className="text-sm font-medium text-gray-500 tracking-wide whitespace-nowrap"
                                                        style={{ paddingRight: '16px' }}
                                                    >
                                                        Funding Progress
                                                    </Text>
                                                    <Text
                                                        strong
                                                        className="text-sm text-indigo-700 whitespace-nowrap"
                                                        style={{ paddingLeft: '16px' }}
                                                    >
                                                        {formatCurrency(fundingData.current)} / {formatCurrency(fundingData.goal)}
                                                    </Text>
                                                </div>

                                                <Progress
                                                    percent={Math.round(progressPercentage)}
                                                    status="active"
                                                    strokeColor={{
                                                        '0%': '#3b82f6',
                                                        '100%': '#10b981',
                                                    }}
                                                    showInfo={false}
                                                    strokeWidth={10}
                                                />

                                                <Text
                                                    type="secondary"
                                                    className="text-xs text-gray-500 block mt-2 text-center"
                                                >
                                                    {Math.round(progressPercentage)}% funded
                                                </Text>
                                            </div>

                                            {/* Right: Project Quick Info */}
                                            <div className="flex flex-col justify-start text-sm text-gray-700 text-left space-y-[55px]">
                                                <div>
                                                    <Text strong className="block text-gray-800">Stage:</Text>
                                                    <Text>{formatFundingStage(project.fundingStage) || 'Seed'}</Text>
                                                </div>
                                                <div>
                                                    <Text strong className="block text-gray-800">Team:</Text>
                                                    <Text>{teamSize} members</Text>
                                                </div>
                                                <div>
                                                    <Text strong className="block text-gray-800">Status: </Text>
                                                    <Tag color={project.status === 'APPROVED' ? 'green' : 'orange'}>
                                                        {project.status === 'APPROVED' ? 'Approved' : 'Pending'}
                                                    </Tag>
                                                </div>
                                            </div>
                                        </div>

                                        {/* View Details Button */}
                                        <Button
                                            type="primary"
                                            block
                                            icon={<EyeOutlined />}
                                            onClick={() => {
                                                setSelectedProject(project);
                                                setDetailVisible(true);
                                            }}
                                            className="mt-auto"
                                            size="middle"
                                            style={{
                                                height: '40px',
                                                borderRadius: '6px',
                                                fontSize: '14px',
                                                fontWeight: '500',
                                                marginTop: '20px',
                                            }}
                                        >
                                            View Details
                                        </Button>
                                    </div>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>

                {/* Empty State */}
                {filteredProjects.length === 0 && (
                    <div className="flex justify-center mt-12">
                        <Card
                            className="text-center border border-gray-200 shadow-sm max-w-md w-full rounded-lg bg-white"
                            bodyStyle={{ padding: '40px 24px' }}
                        >
                            <div className="text-5xl text-gray-300 mb-4">
                                <svg width="60" height="60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <Title level={4} className="text-gray-700 mb-3">No Projects Available</Title>
                            <Paragraph className="text-gray-500 mb-6 text-sm">
                                {filter !== 'all'
                                    ? `No ${formatCategory(filter)} projects found. Try a different category.`
                                    : 'No investment opportunities available right now.'}
                            </Paragraph>
                            {filter !== 'all' && (
                                <Button
                                    type="primary"
                                    onClick={() => setFilter('all')}
                                    size="middle"
                                    style={{
                                        borderRadius: '6px',
                                        height: '40px',
                                        fontSize: '14px',
                                        fontWeight: '500'
                                    }}
                                >
                                    View All Projects
                                </Button>
                            )}
                        </Card>
                    </div>
                )}
            </div>

            {/* Project Detail Modal */}
            <Modal
                title={null}
                open={detailVisible}
                onCancel={() => setDetailVisible(false)}
                footer={null}
                width={800}
                bodyStyle={{ padding: 0 }}
                centered
                className="project-detail-modal"
            >
                {selectedProject && (
                    <div className="rounded-lg overflow-hidden">
                        {/* Header Section */}
                        <div className="bg-gradient-to-r from-blue-50 to-gray-50 px-8 py-6 border-b border-gray-200">
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1">
                                    <Title level={3} className="m-0 text-gray-900 mb-2 leading-tight">
                                        {selectedProject.projectName || 'Unnamed Project'}
                                    </Title>
                                    <Text type="secondary" className="text-lg font-medium block text-gray-600">
                                        {getCompanyName(selectedProject)}
                                    </Text>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <Tag color={selectedProject.status === 'APPROVED' ? 'green' : 'orange'} className="m-0 text-xs px-3 py-1 font-medium">
                                        {selectedProject.status === 'APPROVED' ? 'Open Access' : 'NDA Required'}
                                    </Tag>
                                    <Tag color={getCategoryTagColor(selectedProject.category)} className="m-0 text-xs px-3 py-1 font-medium">
                                        {formatCategory(selectedProject.category)}
                                    </Tag>
                                </div>
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="p-8">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Main Content */}
                                <div className="lg:col-span-2 space-y-6">
                                    {/* Description */}
                                    <div>
                                        <Title level={4} className="text-gray-900 mb-4 text-base">Project Description</Title>
                                        <Paragraph className="text-gray-700 text-sm leading-relaxed">
                                            {getProjectDescription(selectedProject)}
                                        </Paragraph>
                                    </div>

                                    {/* Funding Progress */}
                                    <div>
                                        <Title level={4} className="text-gray-900 mb-4 text-base">Funding Progress  </Title>
                                        <Card
                                            size="small"
                                            bordered={false}
                                            className="bg-gray-50 border-0 rounded-lg"
                                            bodyStyle={{ padding: '20px' }}
                                        >
                                            <div className="flex justify-between items-center mb-3">
                                                <Text strong className="text-sm">Funding Goal</Text>
                                                <Text strong className="text-sm">
                                                    {formatCurrency(getFundingData(selectedProject).current)} / {formatCurrency(getFundingData(selectedProject).goal)}
                                                </Text>
                                            </div>
                                            <Progress
                                                percent={Math.round((getFundingData(selectedProject).current / getFundingData(selectedProject).goal) * 100)}
                                                status="active"
                                                strokeColor={{
                                                    '0%': '#3b82f6',
                                                    '100%': '#10b981',
                                                }}
                                                className="mb-3"
                                            />
                                            <div className="text-center">
                                                <Text type="secondary" className="text-xs">
                                                    {selectedProject.fundingStage ? formatFundingStage(selectedProject.fundingStage) : 'Seed Round'} • {Math.round((getFundingData(selectedProject).current / getFundingData(selectedProject).goal) * 100)}% funded
                                                </Text>
                                            </div>
                                        </Card>
                                    </div>
                                </div>

                                {/* Sidebar - Project Details */}
                                <div className="space-y-6">
                                    <Card
                                        size="small"
                                        bordered={false}
                                        className="bg-blue-50 border-0 rounded-lg"
                                        bodyStyle={{ padding: '20px' }}
                                    >
                                        <Title level={4} className="text-gray-900 mb-4 text-base">Project Details</Title>
                                        <Space direction="vertical" size="middle" className="w-full">
                                            <div className="flex justify-between items-center">
                                                <Text type="secondary" className="text-xs">Team Size: </Text>
                                                <Text strong className="text-xs">{getTeamSize(selectedProject)} members</Text>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <Text type="secondary" className="text-xs">Funding Stage: </Text>
                                                <Text strong className="text-xs">{formatFundingStage(selectedProject.fundingStage) || 'Seed'}</Text>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <Text type="secondary" className="text-xs">Location: </Text>
                                                <Text strong className="text-xs">{selectedProject.location || 'Not specified'}</Text>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <Text type="secondary" className="text-xs">Website: </Text>
                                                <a
                                                    href={getWebsiteUrl(selectedProject)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 font-medium text-xs"
                                                >
                                                    Visit Website
                                                </a>
                                            </div>
                                        </Space>
                                    </Card>

                                    {/* Contact Information */}
                                    <Card
                                        size="small"
                                        bordered={false}
                                        className="bg-green-50 border-0 rounded-lg"
                                        bodyStyle={{
                                            padding: '28px 24px'
                                        }}
                                    >
                                        <Title level={4} className="text-gray-900 mb-4 text-base">Get Involved</Title>
                                        <Paragraph className="text-gray-700 mb-4 text-sm leading-relaxed">
                                            Interested in this investment opportunity? Contact us to learn more.
                                        </Paragraph>
                                        <Button
                                            type="primary"
                                            block
                                            size="middle"
                                            style={{
                                                borderRadius: '6px',
                                                height: '40px',
                                                fontSize: '14px',
                                                fontWeight: '500'
                                            }}
                                        >
                                            Request More Information
                                        </Button>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}

export default FindProjects;