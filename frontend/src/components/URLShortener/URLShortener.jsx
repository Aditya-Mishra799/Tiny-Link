import React, { useState } from 'react';
import styles from './URLShortener.module.css';
import Input from '../Input/Input';
import Button from '../Button/Button';
import getApiURL from '../../utils/getApiURl';
import { toast } from 'react-toastify';

const URLShortener = ({ onURLAdded }) => {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [shortURL, setShortURL] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(getApiURL('/api/links'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ url }),
            });

            const json = await response.json();
            if (!response.ok) {
                return toast.error(json.error?.message || 'Failed to shorten URL');
            }

            setShortURL(json.data);
            setUrl('');
            toast.success('URL shortened successfully!');
            if (onURLAdded) onURLAdded();
        } catch (error) {
            toast.error('Failed to shorten URL');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        const fullURL = `${window.location.origin}/${shortURL.shortcode}`;
        navigator.clipboard.writeText(fullURL);
        toast.success('Copied to clipboard!');
    };

    return (
        <div className={styles.container}>
            <h2>Shorten Your URL</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
                <Input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Enter your long URL"
                    type="url"
                    required
                />
                <Button type="submit" loading={loading}>Shorten URL</Button>
            </form>

            {shortURL && (
                <div className={styles.result}>
                    <h3>Your shortened URL:</h3>
                    <div className={styles.urlDisplay}>
                        <code>{window.location.origin}/{shortURL.shortcode}</code>
                        <button onClick={copyToClipboard} className={styles.copyBtn}>
                            Copy
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default URLShortener;
