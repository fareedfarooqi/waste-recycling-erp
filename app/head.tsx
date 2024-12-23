import { metadata } from './metadata';

export default function Head() {
    return (
        <>
            <title>{metadata.title}</title>
            <meta name="description" content={metadata.description} />
            <meta
                name="viewport"
                content="width=device-width, initial-scale=1"
            />
            <link rel="icon" href="/favicon.ico" />
        </>
    );
}
