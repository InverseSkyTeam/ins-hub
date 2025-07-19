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
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '16px',
                    justifyContent: 'flex-start',
                }}
            >
                {imgs.map((img: any, index) => (
                    <Card
                        key={index}
                        style={{
                            width: 'calc(25% - 12px)',
                            marginBottom: '16px',
                            textAlign: 'center',
                            padding: '16px',
                            boxSizing: 'border-box',
                        }}
                    >
                        <CardMedia
                            component="img"
                            alt={img.name}
                            loading="lazy"
                            src={`./images/${img.name}`}
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
