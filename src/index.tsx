import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Card, Container, Typography, CardMedia, CardContent, Button } from '@mui/material';
import Masonry from '@mui/lab/Masonry';
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
            <div style={{ display: "flex" }}>
                <Typography variant="h3" component="div">
                    INS Hub
                </Typography>
                <div style={{ flexGrow: 1 }} />
                <Button variant="outlined" onClick={() => {
                    window.open("https://github.com/InverseSkyTeam/ins-hub/upload/master/images");
                }}>
                    前往 GitHub 上传图片
                </Button>
            </div>
            <Masonry columns={4} spacing={2}>
                {imgs.map((img: any, index) => (
                    <Card
                        key={index}
                        style={{
                            textAlign: 'center',
                            padding: '16px',
                        }}
                        onClick={() => {
                            window.open(`./images/${img.name}`)
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
            </Masonry>
        </Container>
    );
};

const dom = document.getElementById('app');
if (dom) {
    const root = createRoot(dom);
    root.render(<App />);
}
