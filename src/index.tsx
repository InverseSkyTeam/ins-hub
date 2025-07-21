import * as React from 'react';
import ReactDOM from 'react-dom/client';
import {
    AppBar, Toolbar, IconButton, Button, InputBase,
    Box, CircularProgress, Drawer, useMediaQuery,
    ThemeProvider, createTheme, PaletteMode, CssBaseline,
    Typography, Card, CardMedia, CardContent, Paper, useTheme
} from '@mui/material';
import {
    Upload as UploadIcon,
    Search as SearchIcon,
    Menu as MenuIcon,
    Close as CloseIcon,
    Close as CircleXIcon,
    Brightness4 as DarkIcon,
    Brightness7 as LightIcon
} from '@mui/icons-material';
import Masonry from '@mui/lab/Masonry';
import { toast } from 'sonner';

interface Image {
    id: number;
    name: string;
}

const getDesignTokens = (mode: PaletteMode) => ({
    palette: {
        mode,
        ...(mode === 'light'
            ? {
                primary: {
                    main: '#3f51b5',
                },
                secondary: {
                    main: '#f50057',
                },
                background: {
                    default: '#e3f2fd',
                    paper: 'rgba(255, 255, 255, 0.8)',
                },
                text: {
                    primary: '#212121',
                    secondary: '#757575',
                }
            }
            : {
                primary: {
                    main: '#7986cb',
                },
                secondary: {
                    main: '#ff4081',
                },
                background: {
                    default: '#0d47a1',
                    paper: 'rgba(33, 33, 33, 0.8)',
                },
                text: {
                    primary: '#e0e0e0',
                    secondary: '#b0b0b0',
                }
            }),
    },
    typography: {
        fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
            '"Apple Color Emoji"',
            '"Segoe UI Emoji"',
            '"Segoe UI Symbol"',
        ].join(','),
        h5: {
            fontWeight: 700,
        },
    },
    components: {
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backdropFilter: 'blur(20px)',
                    backgroundColor: mode === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(33, 33, 33, 0.8)',
                    borderBottom: mode === 'light' ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(66, 66, 66, 0.3)',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none' as const,
                    fontWeight: 600,
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        transform: 'scale(1.02)',
                        boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)',
                    },
                },
            },
        },
    },
});

const App = () => {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
    const [imgs, setImgs] = React.useState<Image[]>([]);
    const [error, setError] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [mode, setMode] = React.useState<PaletteMode>('light');
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const theme = useTheme();

    const muiTheme = createTheme(getDesignTokens(mode));

    React.useEffect(() => {
        setMode(prefersDarkMode ? 'dark' : 'light');
    }, [prefersDarkMode]);

    const filteredImages = imgs.filter(img =>
        img.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleTheme = () => {
        setMode(prevMode => (prevMode === 'light' ? 'dark' : 'light'));
    };

    React.useEffect(() => {
        const fetchImages = async () => {
            try {
                const res = await fetch('https://api.github.com/repos/InverseSkyTeam/ins-hub/contents/images');
                const data = await res.json();

                if (!res.ok) throw new Error(data.message || '无法获取图像，请稍后再试');

                const imgData = data
                    .filter((item: any) => item.name !== 'ins.webp' && item.type === 'file')
                    .map((item: any, index: number) => ({
                        id: index,
                        name: item.name,
                    }));

                setImgs(imgData);
                setError(null);
            } catch (err: any) {
                toast.error('发生了错误!', {
                    description: err.message || '无法获取图像，请稍后再试'
                });
                setError(err.message || '无法获取图像，请稍后再试');
            } finally {
                setLoading(false);
            }
        };

        fetchImages();
    }, []);

    const getGradientStyle = () => {
        return mode === 'light'
            ? 'linear-gradient(to bottom right, #e3f2fd, #f3e5f5)'
            : 'linear-gradient(135deg, #0f172a, #1e3a8a, #166534)';
    };

    const getButtonGradient = () => {
        return mode === 'light'
            ? 'linear-gradient(to right, #2196f3, #9c27b0)'
            : 'linear-gradient(to right, #42a5f5, #ab47bc)';
    };

    const getTextGradient = () => {
        return {
            background: mode === 'light'
                ? 'linear-gradient(to right, #2196f3, #9c27b0)'
                : 'linear-gradient(to right, #42a5f5, #ab47bc)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
        };
    };

    return (
        <ThemeProvider theme={muiTheme}>
            <CssBaseline />
            <Box sx={{
                minHeight: '100vh',
                background: getGradientStyle(),
                backgroundAttachment: 'fixed',
                pb: 8
            }}>
                <AppBar position="fixed" elevation={0}>
                    <Toolbar sx={{ justifyContent: 'space-between', padding: '3 16px' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', userSelect: 'none' }}>
                            <Paper elevation={3} sx={{
                                p: 0.5,
                                borderRadius: '16px',
                                background: getButtonGradient()
                            }}>
                                <Box
                                    component="img"
                                    src="./images/ins.webp"
                                    alt="INS Logo"
                                    sx={{
                                        borderRadius: '8px',
                                        height: "50px",
                                        objectFit: 'cover'
                                    }}
                                />
                            </Paper>
                            <Typography variant="h5" sx={{ pl: 2, ...getTextGradient() }}>
                                INS HUB
                            </Typography>
                        </Box>

                        <Box sx={{
                            display: { xs: 'none', md: 'flex' },
                            position: 'relative',
                            width: '33%',
                            maxWidth: '500px'
                        }}>
                            <SearchIcon sx={{
                                position: 'absolute',
                                left: 12,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'text.secondary'
                            }} />
                            <InputBase
                                placeholder="搜索图片..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                sx={{
                                    width: '100%',
                                    bgcolor: 'background.paper',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: '50px',
                                    py: 1,
                                    px: 4,
                                    pl: '40px',
                                    '&:focus-within': {
                                        borderColor: 'primary.main',
                                        boxShadow: '0 0 0 2px rgba(63, 81, 181, 0.2)'
                                    }
                                }}
                            />
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <IconButton 
                                onClick={toggleTheme}
                                sx={{ 
                                    color: mode === 'light' ? '#212121' : 'inherit'
                                }}
                            >
                                {mode === 'dark' ? <LightIcon /> : <DarkIcon />}
                            </IconButton>

                            <Button
                                variant="contained"
                                startIcon={<UploadIcon />}
                                href="https://github.com/InverseSkyTeam/ins-hub/upload/master/images"
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{
                                    display: { xs: 'none', md: 'flex' },
                                    background: getButtonGradient(),
                                    color: 'white'
                                }}
                            >
                                上传图片
                            </Button>

                            <IconButton
                                color="inherit"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                sx={{ display: { md: 'none' } }}
                            >
                                {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
                            </IconButton>
                        </Box>
                    </Toolbar>
                </AppBar>

                <Drawer
                    anchor="top"
                    open={mobileMenuOpen}
                    onClose={() => setMobileMenuOpen(false)}
                    sx={{
                        '& .MuiDrawer-paper': {
                            top: '64px',
                            bgcolor: 'background.paper',
                            backdropFilter: 'blur(20px)',
                            borderBottom: '1px solid',
                            borderColor: 'divider'
                        }
                    }}
                >
                    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ position: 'relative' }}>
                            <SearchIcon sx={{
                                position: 'absolute',
                                left: 14,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'text.secondary'
                            }} />
                            <InputBase
                                placeholder="搜索图片..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                sx={{
                                    width: '100%',
                                    bgcolor: 'background.paper',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: '50px',
                                    py: 1.5,
                                    px: 4,
                                    pl: '40px',
                                    '&:focus-within': {
                                        borderColor: 'primary.main',
                                        boxShadow: '0 0 0 2px rgba(63, 81, 181, 0.2)'
                                    }
                                }}
                            />
                        </Box>
                        <Button
                            variant="contained"
                            fullWidth
                            startIcon={<UploadIcon />}
                            href="https://github.com/InverseSkyTeam/ins-hub/upload/master/images"
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                                background: getButtonGradient(),
                                color: 'white'
                            }}
                        >
                            上传图片
                        </Button>
                    </Box>
                </Drawer>

                <Box sx={{ pt: '100px', px: { xs: 2, sm: 4, md: 6 } }}>
                    {loading ? (
                        <Box sx={{ textAlign: 'center', py: 10 }}>
                            <CircularProgress
                                size={64}
                                thickness={2}
                                sx={{
                                    ...getTextGradient(),
                                    mb: 3
                                }}
                            />
                            <Typography variant="body1" color="text.secondary">
                                正在加载图片...
                            </Typography>
                        </Box>
                    ) : error ? (
                        <Box sx={{ textAlign: 'center', py: 10 }}>
                            <Box sx={{
                                bgcolor: 'background.paper',
                                border: '2px dashed',
                                borderColor: 'divider',
                                borderRadius: '16px',
                                width: 64,
                                height: 64,
                                mx: 'auto',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <CircleXIcon color="error" fontSize="large" />
                            </Box>
                            <Typography variant="h6" sx={{ mt: 3, fontWeight: 600 }}>
                                发生了一些错误! 请尝试刷新页面!
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                                {error}
                            </Typography>
                        </Box>
                    ) : (
                        <>
                            <Masonry columns={4} spacing={2}>
                                {filteredImages.map(img => (
                                    <Card sx={{
                                        borderRadius: '16px',
                                    }}>
                                        <CardMedia
                                            component="img"
                                            image={`./images/${img.name}`}
                                            alt={img.name.replace(/\.[^/.]+$/, '')}
                                            sx={{
                                                width: '100%',
                                                transition: 'transform 0.5s ease',
                                                cursor: 'pointer',
                                                '&:hover': {
                                                    transform: 'scale(1.05)'
                                                }
                                            }}
                                            onClick={() => {
                                                window.open(`./images/${img.name}`, '_blank');
                                            }}
                                            loading="lazy"
                                        />
                                        <CardContent sx={{
                                            bgcolor: 'background.paper',
                                            backdropFilter: 'blur(10px)',
                                            flexGrow: 1
                                        }}>
                                            <Typography
                                                variant="body1"
                                                fontWeight="medium"
                                                textAlign="center"
                                                noWrap
                                            >
                                                {img.name.replace(/\.[^/.]+$/, '')}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                ))}
                            </Masonry>

                            {filteredImages.length === 0 && (
                                <Box sx={{ textAlign: 'center', py: 10 }}>
                                    <Box sx={{
                                        bgcolor: 'background.paper',
                                        border: '2px dashed',
                                        borderColor: 'divider',
                                        borderRadius: '16px',
                                        width: 64,
                                        height: 64,
                                        mx: 'auto',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <SearchIcon color="disabled" fontSize="large" />
                                    </Box>
                                    <Typography variant="h6" sx={{ mt: 3, fontWeight: 600 }}>
                                        未找到匹配的图片
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                                        尝试其他搜索关键词或上传新图片
                                    </Typography>
                                </Box>
                            )}
                        </>
                    )}
                </Box>
            </Box>
        </ThemeProvider>
    );
}

const root = document.getElementById('app');
if (root) {
    ReactDOM.createRoot(root).render(<App />);
}