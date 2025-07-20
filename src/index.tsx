import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Card, Container, Typography, CardMedia, CardContent, Button } from '@mui/material';
import Masonry from '@mui/lab/Masonry';
import 'tailwindcss/index.css';

const App = () => {
    const [imgs, setImgs] = React.useState<any[]>([]);
    React.useEffect(() => {
        document.body.style.background = 'linear-gradient(to right bottom,rgba(111,255,255,0.2),rgba(111,255,189,0.3),rgba(255,233,111,0.4))';
        let ignore = false;
        const func = async () => {
            const response = await fetch('https://api.github.com/repos/InverseSkyTeam/ins-hub/contents/images');
            // const response = await fetch('https://api.github.com/repos/ClassIsland/ClassIsland-hub/contents/images');
            const data = await response.json();
            const newData = {};
            for (const item of data) {
                if (item.name === 'output.webp') continue;
                newData[item.name] = item;
            }
            if (!ignore) setImgs(Object.values(newData));
        };

        if (!ignore) func().then(() => null);
        return () => {
            ignore = true;
            document.body.style.background = '';
        };
    }, []);

    return (
        <Container>
            <div style={{ display: 'flex', marginBottom: '16px', backgroundColor: '#141428' }}>
                <img src="./images/output.webp" loading='lazy' alt="logo" style={{ height: '50px' }} />
                <Typography variant="h3" component="div" color="#66faca">
                    INS Hub
                </Typography>
                <div style={{ flexGrow: 1 }} />
                <Button
                    variant="outlined"
                    onClick={() => {
                        window.open('https://github.com/InverseSkyTeam/ins-hub/upload/master/images');
                    }}
                    style={{
                        margin: 4,
                        backgroundColor: '#efefef'
                    }}
                >
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
                            cursor: 'pointer',
                        }}
                        onClick={() => {
                            window.open(`./images/${img.name}`);
                        }}
                    >
                        <CardMedia component="img" alt={img.name} loading="lazy" src={`./images/${img.name}`} />
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
