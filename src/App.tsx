import { useState, useEffect, useCallback } from 'react';
import ThemeModeButton from '@/components/ThemeModeButton.tsx';
import { Upload, Search, Menu, X, CircleX } from 'lucide-react';
import { toast } from 'sonner';

interface Image {
    id: string;
    name: string;
    path: string;
    download_url: string;
}

export default function App() {
    const [searchQuery, setSearchQuery] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [images, setImages] = useState<Image[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<Image | null>(null);

    const filteredImages = images.filter(img => img.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const fetchImages = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch(
                'https://api.github.com/repos/InverseSkyTeam/ins-hub/contents/images'
            );
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || '无法获取图像，请稍后再试');

            const imgData = data
                .filter((item: Image) => item.name !== 'output.webp')
                .map((item: Image) => {
                    return {
                        id: item.id,
                        name: item.name,
                        path: item.path,
                        download_url: item.download_url,
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
                            {filteredImages.map((img) => {
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
                                                className="w-full h-auto block"
                                                loading="lazy"
                                            />
                                        </div>

                                        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-3">
                                            <p className="text-gray-800 dark:text-gray-200 font-medium text-center truncate mb-1">
                                                {img.name.replace(/\.[^/.]+$/, '')}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {filteredImages.length === 0 && (
                            <div className="text-center py-20">
                                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto flex items-center justify-center">
                                    <Search className="h-8 w-8 text-gray-500" />
                                </div>
                                <h3 className="mt-4 text-xl font-medium text-gray-900 dark:text-white">
                                    未找到匹配的图片
                                </h3>
                                <p className="mt-2 text-gray-600 dark:text-gray-400">尝试其他搜索关键词或上传新图片</p>
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
                                src={`http://ins-hub.lrsgzs.top/images/${selectedImage.name}`}
                                alt={selectedImage.name}
                                className="w-full rounded-lg shadow-lg"
                            />

                            <div className="mt-4">
                                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                                    {selectedImage.name.replace(/\.[^/.]+$/, '')}
                                </h2>
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
