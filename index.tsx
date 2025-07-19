import * as React from'react';
import { createRoot } from 'react-dom/client';
import { Card,Container,Typography,CardMedia,CardContent } from '@mui/material';
import { v4 as generateUUID } from 'uuid';
import 'tailwindcss/index.css';

const App = () => {
    const [imgs, setImgs] = React.useState<any[]>([]);
    React.useEffect(() => {
        let ignore = false;
        const func = async () => {
            const response = await fetch('https://api.github.com/repos/ClassIsland/classisland-hub/contents/images');
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
            <div style={{ display: 'grid', gridTemplateColumns: "repeat(4, 1fr)", gap: '16px' }}>
                {imgs.map((img: any) => (
                    <Card key={generateUUID()}>
                        <CardMedia image={img.download_url} />
                        <CardContent>
                            <Typography variant="h5" component="div">
                                {img.name}
                            </Typography>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </Container>
    )
};

const root = createRoot(document.getElementById('app') as HTMLElement);
root.render(<App />);