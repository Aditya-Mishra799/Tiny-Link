import React, { useState, useEffect } from 'react';
import styles from './URLsTable.module.css';
import getApiURL from '../../utils/getApiURl';
import { toast } from 'react-toastify';
import { Trash2, ExternalLink, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const URLsTable = ({ refreshTrigger }) => {
    const [urls, setUrls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 10;
    const navigate = useNavigate();

    const fetchURLs = async () => {
        setLoading(true);
        try {
            const response = await fetch(getApiURL(`/api/links?page=${page}&limit=${limit}`), {
                credentials: 'include',
            });
            const json = await response.json();
            if (response.ok) {
                setUrls(json.data.urls);
                setTotal(json.data.total);
            }
        } catch (error) {
            toast.error('Failed to fetch URLs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchURLs();
    }, [page, refreshTrigger]);

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to deactivate this URL?')) return;

        try {
            const response = await fetch(getApiURL(`/api/links/${id}`), {
                method: 'DELETE',
                credentials: 'include',
            });

            if (response.ok) {
                toast.success('URL deactivated successfully');
                fetchURLs();
            } else {
                toast.error('Failed to deactivate URL');
            }
        } catch (error) {
            toast.error('Failed to deactivate URL');
        }
    };

    const handleRowClick = (id) => {
        navigate(`/url/${id}`);
    };

    const totalPages = Math.ceil(total / limit);

    if (loading) {
        return <div className={styles.loading}>Loading...</div>;
    }
    const copyLink = (e, link) => {
        e.stopPropagation()
        navigator.clipboard.writeText(link);
        toast.success("Link copied successfully!")
    }
    
    return (
        <div className={styles.container}>
            <h2>Your Shortened URLs</h2>
            {urls.length === 0 ? (
                <p className={styles.empty}>No URLs found. Create your first shortened URL above!</p>
            ) : (
                <>
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Short Link</th>
                                    <th>Original URL</th>
                                    <th>Clicks</th>
                                    <th>Unique Clicks</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {urls.map((url) => (
                                    <tr key={url.id} onClick={() => handleRowClick(url.id)} className={styles.clickableRow}>
                                        <td className={styles.shortLink}>
                                            <div className={styles.shortLinkWrapper} title={`${import.meta.env.VITE_BASE_URL}/${url.shortcode}`}>
                                                <code className={styles.shortcode}>
                                                    {import.meta.env.VITE_BASE_URL}/{url.shortcode}
                                                </code>

                                                <button
                                                    className={styles.copyBtn}
                                                    onClick={(e) => copyLink(e, `${import.meta.env.VITE_BASE_URL}/${url.shortcode}`)}
                                                >
                                                   <Copy size={16} />
                                                </button>
                                            </div>
                                        </td>
                                        <td className={styles.longUrl}>
                                            <a href={url.long_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                                                {url.long_url.substring(0, 50)}...
                                                <ExternalLink size={14} />
                                            </a>
                                        </td>
                                        <td>{url.clicks || 0}</td>
                                        <td>{url.unique_clicks || 0}</td>
                                        <td>{new Date(url.created_at).toLocaleDateString()}</td>
                                        <td>
                                            <button
                                                onClick={(e) => handleDelete(url.id, e)}
                                                className={styles.deleteBtn}
                                                title="Deactivate URL"
                                            >
                                                <Trash2 size={18} />
                                            </button>
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
    );
};

export default URLsTable;
