import { useState, useEffect, useCallback } from 'react';
import ThemeModeButton from '@/components/ThemeModeButton.tsx';
import { Upload, Search, Menu, X, CircleX, Clock, Flame } from 'lucide-react';
import { toast } from 'sonner';

interface Image {
    id: string;
    name: string;
    path: string;
    download_url: string;
    timestamp: string;
    tags: string[];
}

export default function App() {
    const [searchQuery, setSearchQuery] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [images, setImages] = useState<Image[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTag, setActiveTag] = useState<string>('all');
    const [timeFilter, setTimeFilter] = useState<'all' | 'week' | 'month'>('all');
    const [selectedImage, setSelectedImage] = useState<Image | null>(null);

    const parseTags = (name: string): string[] => {
        const matches = name.match(/\[(.*?)\]/g);
        if (!matches) return [];
        return matches.map((tag) => tag.replace(/[\[\]]/g, ''));
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const fetchImages = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch(
                'https://api.github.com/repos/InverseSkyTeam/ins-hub/contents/images'
            );
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || '无法获取图像，请稍后再试');

            const imgData = data
                .filter((item: Image) => item.name !== 'output.webp' && item.type === 'file')
                .map((item: Image) => {
                    const randomDaysAgo = Math.floor(Math.random() * 30) + 1;
                    const randomDate = new Date(
                        Date.now() - randomDaysAgo * 24 * 60 * 60 * 1000
                    ).toISOString();

                    return {
                        id: item.sha,
                        name: item.name,
                        path: item.path,
                        download_url: item.download_url,
                        timestamp: randomDate,
                        tags: parseTags(item.name),
                    };
                });

            setImages(imgData);
            setError(null);
        } catch (err: any) {
            toast.error('发生了错误!', {
                description: err.message || '无法获取图像，请稍后再试',
                position: 'top-center',
                duration: 3000,
            });
            setError(err.message || '无法获取图像，请稍后再试');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchImages();
    }, [fetchImages]);

    const filteredImages = images.filter((img) => {
        const matchesSearch = img.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTag = activeTag === 'all' || img.tags.includes(activeTag);

        const now = new Date();
        const imgDate = new Date(img.timestamp);
        let matchesTime = true;

        if (timeFilter === 'week') {
            const lastWeek = new Date(now.setDate(now.getDate() - 7));
            matchesTime = imgDate > lastWeek;
        } else if (timeFilter === 'month') {
            const lastMonth = new Date(now.setMonth(now.getMonth() - 1));
            matchesTime = imgDate > lastMonth;
        }

        return matchesSearch && matchesTag && matchesTime;
    });

    const sortedImages = [...filteredImages].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const allTags = Array.from(new Set(images.flatMap((img) => img.tags))).filter(
        (tag) => tag
    ) as any[];

    return (
        <div className="min-h-screen w-full bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 from-blue-50 to-purple-50">
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-white/30 dark:border-gray-700/30 shadow-sm flex justify-between items-center px-4 py-2">
                <div className="flex items-center">
                    <div className="bg-gradient-to-r from-blue-400 to-indigo-600 p-1 rounded-xl">
                        <img
                            src="/ins.webp"
                            alt="INS Logo"
                            className="rounded-lg"
                            width={65}
                            height={65}
                        />
                    </div>
                    <p className="text-2xl pl-3 font-bold bg-gradient-to-r from-blue-400 to-indigo-600 bg-clip-text text-transparent">
                        INS HUB
                    </p>
                </div>

                <div className="hidden md:flex relative w-1/3 max-w-md">
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-500 dark:text-gray-400" />
                    <input
                        type="text"
                        placeholder="搜索逆天发言..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="dark:text-gray-400 w-full bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 rounded-full py-2 px-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                <div className="flex items-center space-x-3">
                    <ThemeModeButton />

                    <a
                        href="https://github.com/InverseSkyTeam/ins-hub/upload/master/images"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hidden md:inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-400 to-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow hover:shadow-md transition-all hover:scale-[1.02]"
                    >
                        <Upload className="w-4 h-4" />
                        上传逆天发言
                    </a>

                    <button
                        className="md:hidden p-2 rounded-md text-gray-700 dark:text-gray-300"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </nav>

            {mobileMenuOpen && (
                <div className="fixed top-16 left-0 right-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-b border-white/30 dark:border-gray-700/30 shadow-md md:hidden">
                    <div className="px-4 py-4">
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-500 dark:text-gray-400" />
                            <input
                                type="text"
                                placeholder="搜索逆天发言..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-full py-2 px-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="flex gap-2 mb-3">
                            <button
                                onClick={() => setTimeFilter('all')}
                                className={`flex-1 py-2 text-sm rounded-lg ${timeFilter === 'all' ? 'bg-indigo-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                            >
                                全部时间
                            </button>
                            <button
                                onClick={() => setTimeFilter('week')}
                                className={`flex-1 py-2 text-sm rounded-lg ${timeFilter === 'week' ? 'bg-indigo-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                            >
                                本周
                            </button>
                            <button
                                onClick={() => setTimeFilter('month')}
                                className={`flex-1 py-2 text-sm rounded-lg ${timeFilter === 'month' ? 'bg-indigo-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                            >
                                本月
                            </button>
                        </div>

                        <a
                            href="https://github.com/InverseSkyTeam/ins-hub/upload/master/images"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex justify-center items-center gap-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow w-full"
                        >
                            <Upload className="w-4 h-4" />
                            上传新发言
                        </a>
                    </div>
                </div>
            )}

            <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
                {!loading && !error && (
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <div className="flex flex-wrap gap-2">
                            {allTags.map((tag) => (
                                <button
                                    key={tag}
                                    onClick={() => setActiveTag(tag)}
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                                        activeTag === tag
                                            ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md'
                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setTimeFilter('all')}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium dark:text-white  ${
                                    timeFilter === 'all'
                                        ? 'bg-gradient-to-r from-green-500 to-teal-600 text-white'
                                        : 'bg-gray-200 dark:bg-gray-700'
                                }`}
                            >
                                <Clock className="w-4 h-4" /> 全部时间
                            </button>
                            <button
                                onClick={() => setTimeFilter('week')}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium dark:text-white ${
                                    timeFilter === 'week'
                                        ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white'
                                        : 'bg-gray-200 dark:bg-gray-700'
                                }`}
                            >
                                <Flame className="w-4 h-4" /> 本周
                            </button>
                            <button
                                onClick={() => setTimeFilter('month')}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium dark:text-white ${
                                    timeFilter === 'month'
                                        ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white'
                                        : 'bg-gray-200 dark:bg-gray-700'
                                }`}
                            >
                                <Flame className="w-4 h-4" /> 本月
                            </button>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-20">
                        <div className="animate-pulse bg-gradient-to-r from-blue-400 to-indigo-600 rounded-xl w-16 h-16 mx-auto mb-4"></div>
                        <p className="text-gray-600 dark:text-gray-400">正在加载逆天发言...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-20">
                        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto flex items-center justify-center">
                            <CircleX className="h-8 w-8 text-red-500" />
                        </div>
                        <h3 className="mt-4 text-xl font-medium text-gray-900 dark:text-white">
                            发生了一些错误! 请尝试刷新页面!
                        </h3>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">{error}</p>
                        <button
                            onClick={fetchImages}
                            className="mt-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-lg shadow hover:shadow-md transition-all"
                        >
                            重新加载
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="w-full columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
                            {sortedImages.map((img) => {
                                return (
                                    <div
                                        key={img.id}
                                        className="mb-4 break-inside-avoid cursor-pointer rounded-xl overflow-hidden shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
                                        onClick={() => setSelectedImage(img)}
                                    >
                                        <div className="relative">
                                            <img
                                                src={`http://ins-hub.lrsgzs.top/images/${img.name}`}
                                                alt={img.name.replace(/\.[^/.]+$/, '')}
                                                className="block"
                                                loading="lazy"
                                            />

                                            {img.tags.length > 0 && (
                                                <div className="absolute top-2 right-2 flex flex-wrap gap-1">
                                                    {img.tags.slice(0, 2).map((tag) => (
                                                        <span
                                                            key={tag}
                                                            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs px-2 py-1 rounded-full shadow"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-3">
                                            <p className="text-gray-800 dark:text-gray-200 font-medium text-center truncate mb-1">
                                                {img.name.replace(/\.[^/.]+$/, '')}
                                            </p>

                                            <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                                                <span>{formatDate(img.timestamp)}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {sortedImages.length === 0 && (
                            <div className="text-center py-20">
                                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto flex items-center justify-center">
                                    <Search className="h-8 w-8 text-gray-500" />
                                </div>
                                <h3 className="mt-4 text-xl font-medium text-gray-900 dark:text-white">
                                    未找到匹配的发言
                                </h3>
                                <p className="mt-2 text-gray-600 dark:text-gray-400">
                                    尝试其他搜索关键词或上传新内容
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {selectedImage && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <div
                        className="relative bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-all"
                        >
                            <X className="text-white w-5 h-5" />
                        </button>

                        <div className="p-4">
                            <img
                                src={selectedImage.download_url}
                                alt={selectedImage.name}
                                className="w-full rounded-lg shadow-lg"
                            />

                            <div className="mt-4">
                                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                                    {selectedImage.name.replace(/\.[^/.]+$/, '')}
                                </h2>

                                <div className="flex flex-wrap gap-2 mt-2">
                                    {selectedImage.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm px-3 py-1 rounded-full"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Clock className="w-4 h-4" />
                                        <span>上传时间: {formatDate(selectedImage.timestamp)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <footer className="py-6 text-center text-gray-600 dark:text-gray-400 text-sm">
                <p className="mt-1">共收录 {images.length} 条逆天发言</p>
            </footer>
        </div>
    );
}
