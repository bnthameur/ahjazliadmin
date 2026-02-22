'use client';

import { EmojiProvider } from 'react-apple-emojis';
import emojiData from 'react-apple-emojis/src/data.json';

export default function AppProviders({ children }: { children: React.ReactNode }) {
    return (
        <EmojiProvider data={emojiData}>
            {children}
        </EmojiProvider>
    );
}
