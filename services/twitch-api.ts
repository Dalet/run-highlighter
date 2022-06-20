import { FetchOptions } from "ohmyfetch";
import { CLIENT_ID } from "~~/globals";
import { useTwitchAuthStore } from '~~/store/auth/twitch';

export type ValidateResponse = {
    client_id: string,
    login: string,
    user_id: number,
    expires_in: number
    scopes: string[]
}

export type UserResponse = {
    id: number,
    login: string,
    display_name: string,
    profile_image_url: string
};

type Paginated ={
    pagination: {
        cursor?: string
    }
}
type Abortable = { abortSignal?: AbortSignal }

function useHelix(): FetchOptions {
    const state = useTwitchAuthStore();
    return {
        headers: {
            Authorization: `Bearer ${state.accessToken}`,
            "Client-Id": CLIENT_ID
        },
        baseURL: "https://api.twitch.tv/helix",
    }; 
}

async function validate(access_token?: string): Promise<ValidateResponse> {
    if (access_token === undefined) {
        const state = useTwitchAuthStore();
        if (state.isSignedIn) {
            access_token = state.accessToken!;
        } else {
            throw new Error("Not signed in with Twitch");
        }
    }

    return await $fetch("validate", {
        headers: {
            Authorization: `OAuth ${access_token}` 
        },
        baseURL: "https://id.twitch.tv/oauth2",
    });
}

async function getUser(): Promise<UserResponse> {
    const state = useTwitchAuthStore();
    const res = await $fetch("/users", {
        ...useHelix(),
        params: {
            id: state.userId
        },

    }) as { data: UserResponse[] };
    return res.data[0];
}

async function getUserByName(username: string): Promise<UserResponse> {
    const res = await $fetch("/users", {
        ...useHelix(),
        params: {
            login: username
        }
    }) as { data: UserResponse[] };
    return res.data[0];
}

const userIdCache: { [key: string]: number } = {};

export type GetVideosOptions ={
    username?: string,
    limit?: number,
    afterCursor?: string
} & Abortable;
type GetVideosResponse = { data: TwitchVideo[] } & Paginated;
async function getVideos(options?: GetVideosOptions): Promise<GetVideosResponse> {
    let userId: number;
    if (options?.username) {
        let retrievedId: number | undefined = userIdCache[options.username];
        if (!retrievedId) {
            const user = await getUserByName(options.username);
            userIdCache[options.username] = user.id;
            retrievedId = user.id;
        }
        userId = retrievedId;
    } else {
        const state = useTwitchAuthStore();
        userId = state.userId;
    }

    const params: any = {
        user_id: userId,
        type: "archive",
    };
    if (options?.afterCursor) {
        params.after = options.afterCursor;
    }
    if (options?.limit) {
        if (options.limit <= 0) {
            throw new Error("Limit must be greater than 0");
        }
        params.first = options.limit;
    }

    return await $fetch("videos", {
        ...useHelix(),
        params,
        signal: options?.abortSignal
    });
}

async function* iterateVideoPages(options?: GetVideosOptions): AsyncGenerator<TwitchVideo[], void, void> {
    const optionsCopy = { ...options };
    let response: { data: TwitchVideo[] } & Paginated;
    while (true) {
        response = await getVideos(optionsCopy);
        optionsCopy.afterCursor = response.pagination.cursor;
        
        const resultCount = response.data?.length;
        if (resultCount > 0) {
            yield response.data;
        } else {
            break;
        }
    }
}

export function getHighlighterLink(video: TwitchVideo): string {
    return `https://dashboard.twitch.tv/u/${video.user_login}/content/video-producer/highlighter/${video.id}`;
}

export const twitchApi = {
    validate,
    getUser,
    getUserByName,
    getHighlighterLink,
    iterateVideos: iterateVideoPages
};

export interface TwitchVideo {
    id: string,
    stream_id: string;
    user_id: string;
    user_login: string;
    user_name: string;
    title: string;
    description: string;
    created_at: string;
    published_at: string;
    url: string;
    thumbnail_url: string;
    viewable: string;
    view_count: number;
    type: string;
    duration: string;
    pagination: string;
}