import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './URLDetails.module.css';
import getApiURL from '../../utils/getApiURl';
import { toast } from 'react-toastify';
import { ArrowLeft, Copy, ExternalLink } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import Loading from '../../components/Loading/Loading';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

const URLDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [urlData, setUrlData] = useState(null);
    const [clicks, setClicks] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 10;

    useEffect(() => {
        fetchURLDetails();
        fetchStats();
    }, [id, page]);

    const fetchURLDetails = async () => {
        setLoading(true);
        try {
            const response = await fetch(getApiURL(`/api/links/${id}?page=${page}&limit=${limit}`), {
                credentials: 'include',
            });
            const json = await response.json();
            if (response.ok) {
                setUrlData(json.data.url);
                setClicks(json.data.clicks);
                setTotal(json.data.total);
            } else {
                toast.error(json.error?.message || 'Failed to fetch URL details');
                navigate('/');
            }
        } catch (error) {
            toast.error('Failed to fetch URL details');
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await fetch(getApiURL(`/api/links/${id}/stats`), {
                credentials: 'include',
            });
            const json = await response.json();
            if (response.ok) {
                setStats(json.data);
            }
        } catch (error) {
            console.error('Failed to fetch stats');
        }
    };

    const copyToClipboard = () => {
        const fullURL = `${import.meta.env.VITE_BASE_URL}/${urlData.shortcode}`;
        navigator.clipboard.writeText(fullURL);
        toast.success('Copied to clipboard!');
    };

    const totalPages = Math.ceil(total / limit);

    if (loading) {
        return <Loading label="Loading URL details..." />;
    }

    if (!urlData) {
        return null;
    }

    return (
        <div className={styles.container}>
            <button onClick={() => navigate('/')} className={styles.backBtn}>
                <ArrowLeft size={20} />
                Back to Dashboard
            </button>

            <div className={styles.header}>
                <div className={styles.urlInfo}>
                    <h1>URL Analytics</h1>
                    <div className={styles.urlDisplay}>
                        <div className={styles.shortUrl}>
                            <label>Short URL:</label>
                            <code>{import.meta.env.VITE_BASE_URL}/{urlData.shortcode}</code>
                            <button onClick={copyToClipboard} className={styles.copyBtn}>
                                <Copy size={16} />
                            </button>
                        </div>
                        <div className={styles.longUrl}>
                            <label>Original URL:</label>
                            <a href={urlData.long_url} target="_blank" rel="noopener noreferrer">
                                {urlData.long_url}
                                <ExternalLink size={14} />
                            </a>
                        </div>
                    </div>
                </div>

                <div className={styles.statsOverview}>
                    <div className={styles.statCard}>
                        <h3>{urlData.clicks || 0}</h3>
                        <p>Total Clicks</p>
                    </div>
                    <div className={styles.statCard}>
                        <h3>{urlData.unique_clicks || 0}</h3>
                        <p>Unique Clicks</p>
                    </div>
                    <div className={styles.statCard}>
                        <h3>{new Date(urlData.created_at).toLocaleDateString()}</h3>
                        <p>Created</p>
                    </div>
                </div>
            </div>

            {stats && (
                <div className={styles.chartsContainer}>
                    {stats.byDevice && stats.byDevice.length > 0 && (
                        <div className={styles.chartCard}>
                            <h2>Devices</h2>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={stats.byDevice}
                                        dataKey="count"
                                        nameKey="device_type"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        label
                                    >
                                        {stats.byDevice.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {stats.byBrowser && stats.byBrowser.length > 0 && (
                        <div className={styles.chartCard}>
                            <h2>Browsers</h2>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={stats.byBrowser}
                                        dataKey="count"
                                        nameKey="browser"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        label
                                    >
                                        {stats.byBrowser.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {stats.byOS && stats.byOS.length > 0 && (
                        <div className={styles.chartCard}>
                            <h2>Operating Systems</h2>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={stats.byOS}
                                        dataKey="count"
                                        nameKey="os_used"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        label
                                    >
                                        {stats.byOS.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {stats.byGeo && stats.byGeo.length > 0 && (
                        <div className={styles.geoCard}>
                            <h2>Geographic Distribution</h2>
                            <div className={styles.geoList}>
                                {stats.byGeo.map((item, index) => (
                                    <div key={index} className={styles.geoItem}>
                                        <span className={styles.location}>
                                            {item.city}, {item.region}, {item.country}
                                        </span>
                                        <span className={styles.count}>{item.count} clicks</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className={styles.clicksSection}>
                <h2>Click Details</h2>
                {clicks.length === 0 ? (
                    <p className={styles.empty}>No clicks yet</p>
                ) : (
                    <>
                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Time</th>
                                        <th>Location</th>
                                        <th>Device</th>
                                        <th>Browser</th>
                                        <th>OS</th>
                                        <th>Referrer</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {clicks.map((click) => (
                                        <tr key={click.id}>
                                            <td>{new Date(click.created_at).toLocaleString()}</td>
                                            <td>
                                                {click.city}, {click.country}
                                            </td>
                                            <td>{click.device_type || 'Unknown'}</td>
                                            <td>{click.browser || 'Unknown'}</td>
                                            <td>{click.os_used || 'Unknown'}</td>
                                            <td className={styles.referrer}>
                                                {click.referrer ? (
                                                    <a href={click.referrer} target="_blank" rel="noopener noreferrer">
                                                        {click.referrer.substring(0, 30)}...
                                                    </a>
                                                ) : (
                                                    'Direct'
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {totalPages > 1 && (
                            <div className={styles.pagination}>
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className={styles.pageBtn}
                                >
                                    Previous
                                </button>
                                <span className={styles.pageInfo}>
                                    Page {page} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className={styles.pageBtn}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default URLDetails;
