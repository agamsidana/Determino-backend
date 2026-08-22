interface PollOptionResult {
    id: string;
    text: string;
    position: number;
    voteCount: number;
    isSelected: boolean;
}

export interface PollResult {
    id: string;
    options: PollOptionResult[];
}