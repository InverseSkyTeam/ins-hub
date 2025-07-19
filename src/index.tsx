import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Card, Container, Typography, CardMedia, CardContent } from '@mui/material';
import 'tailwindcss/index.css';

const App = () => {
    const [imgs, setImgs] = React.useState<any[]>([]);
    React.useEffect(() => {
        let ignore = false;
        const func = async () => {
            const response = await fetch('https://api.github.com/repos/InverseSkyTeam/ins-hub/contents/images');
            // const response = await fetch('https://api.github.com/repos/ClassIsland/ClassIsland-hub/contents/images');
            const data = await response.json();
            if (!ignore) setImgs(data);
        };

        if (!ignore) func().then(() => null);
        return () => {
            ignore = true;
        };
    }, []);

    return (
        <Container>
            <Typography variant="h3" component="div">
                INS Hub
            </Typography>
            <div
                style={{
                    columnCount: 4,
                    columnGap: '16px',
                }}
            >
                {imgs.map((img: any, index) => (
                    <Card
                        key={index}
                        style={{
                            display: 'inline-block',
                            width: '100%',
                            marginBottom: '16px',
                            textAlign: 'center',
                            breakInside: 'avoid',
                            padding: '16px',
                        }}
                    >
                        <CardMedia
                            component="img"
                            alt={img.name}
                            loading="lazy"
                            src={img.download_url.replace(
                                'https://raw.githubusercontent.com/InverseSkyTeam/ins-hub/main/images/',
                                './images/',
                            )}
                        />
                        <CardContent>
                            <Typography variant="h5" component="div">
                                {img.name}
                            </Typography>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </Container>
    );
};

const dom = document.getElementById('app');
if (dom) {
    const root = createRoot(dom);
    root.render(<App />);
}
