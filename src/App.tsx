import { useState } from 'react';
import ThemeModeButton from '@/components/ThemeModeButton.tsx';
import SearchInput from '@/components/SearchInput.tsx';
import ImageCard from '@/components/ImageCard.tsx';
import ImageModal from '@/components/ImageModal.tsx';
import { CircleX, Menu, Upload, X, Search } from 'lucide-react';
import { useImages } from '@/hooks/useImages';

export default function App() {
    const [searchQuery, setSearchQuery] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<{
        id: string;
        name: string;
        path: string;
        download_url: string;
    } | null>(null);

    const { images, loading, error, refetch } = useImages();

    const filteredImages = images.filter((img) =>
        img.name
            .toLowerCase()
            .replace(/\s+/g, '')
            .includes(searchQuery.toLowerCase().replace(/\s+/g, ''))
    );

    return (
        <div className="min-h-screen w-full bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 from-blue-50 to-purple-50">
            <div className="fixed inset-0 overflow-hidden z-0">
                <div className="absolute top-1/4 -left-10 w-96 h-96 bg-purple-300 dark:bg-purple-900/40 rounded-full filter blur-[100px] opacity-30"></div>
                <div className="absolute bottom-1/3 right-0 w-64 h-64 bg-indigo-300 dark:bg-indigo-900/40 rounded-full filter blur-[100px] opacity-30"></div>
                <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-blue-300 dark:bg-blue-900/40 rounded-full filter blur-[100px] opacity-30"></div>
            </div>

            <nav className="navbar fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-white/30 dark:border-gray-700/30 shadow-sm px-4">
                <div className="navbar-start">
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
                </div>

                <SearchInput value={searchQuery} onChange={setSearchQuery} />

                <div className="navbar-end flex items-center space-x-3">
                    <ThemeModeButton />

                    <a
                        href="https://github.com/InverseSkyTeam/ins-hub/upload/master/public/images"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hidden md:inline-flex btn btn-primary gap-2"
                    >
                        <Upload className="w-4 h-4" />
                        上传发言
                    </a>

                    <button
                        className="md:hidden btn btn-ghost btn-sm"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </nav>

            {mobileMenuOpen && (
                <div className="fixed top-16 left-0 right-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-b border-white/30 dark:border-gray-700/30 shadow-md md:hidden">
                    <div className="px-4 py-4">
                        <SearchInput
                            value={searchQuery}
                            onChange={setSearchQuery}
                        />

                        <a
                            href="https://github.com/InverseSkyTeam/ins-hub/upload/master/images"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary gap-2 w-full"
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
                        <div className="flex flex-wrap gap-2"></div>
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
                        <button onClick={refetch} className="btn btn-primary mt-4">
                            重新加载
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="w-full columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
                            {filteredImages.map((img) => (
                                <ImageCard
                                    key={img.id}
                                    image={img}
                                    onClick={() => setSelectedImage(img)}
                                />
                            ))}
                        </div>

                        {filteredImages.length === 0 && (
                            <div className="text-center py-20">
                                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto flex items-center justify-center">
                                    <Search className="h-8 w-8 text-gray-500" />
                                </div>
                                <h3 className="mt-4 text-xl font-medium text-gray-900 dark:text-white">
                                    未找到匹配的图片
                                </h3>
                                <p className="mt-2 text-gray-600 dark:text-gray-400">
                                    尝试其他搜索关键词或上传新图片
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>

            <ImageModal image={selectedImage} onClose={() => setSelectedImage(null)} />

            {!error && !loading && filteredImages.length > 0 && (
                <footer className="py-6 text-center text-gray-600 dark:text-gray-400 text-sm">
                    <p className="mt-1">共收录 {images.length} 条逆天发言</p>
                </footer>
            )}
        </div>
    );
}
