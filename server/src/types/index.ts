export interface IUseCase<Input, Output> {
  handle(input: Input): Promise<Output>;
}

export interface IPaginationInput {
  page: number;
  limit: number;
}

export interface IPaginationOutPut<T> {
  pagination: {
    page: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  items: T[];
  total: number;
}

export interface IApiMatch {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: Date;
  completed: true;
  home_team: string;
  away_team: string;
  scores: {
    name: string;
    score: string;
  }[];
  last_update: Date;
}
