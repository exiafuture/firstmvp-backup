export interface PreviewPost {
    id: number;
    title: string;
    createdAt: string;
    tags: string[]; // Assuming tags are just names (strings)
    image: string;
}

export interface DetailedPost {
    id: number;
    title: string;
    content: string;
    createdAt: string;
    tags: string[]; // Assuming tags are strings
    image: string[]; // URL of the image
    videos: string[];
}