export enum PRStatus {
  DRAFT = "draft",
  OPEN = "open",
  MERGED = "merged",
  CLOSED = "closed",
}

export type GitHubPullRequest = {
  id: number;
  number: number;
  title: string;
  state: string;
  draft: boolean;
  body: string | null;
  html_url: string;
  created_at: string;
  merged_at: string | null;
  user: {
    login: string;
  };
};

export type GitHubCommit = {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
};

export type SimplifiedPullRequest = {
  id: number;
  number: number;
  title: string;
  state: string;
  prStatus: PRStatus;
  user: {
    login: string;
  };
  createdAt: string;
  mergedAt: string | null;
  draft: boolean;
};

export type SimplifiedPullRequestDetail = SimplifiedPullRequest & {
  body: string | null;
  htmlUrl: string;
};

export type SimplifiedCommit = {
  sha: string;
  message: string;
  author: {
    name: string;
    date: string;
  };
};

export type PaginationInfo = {
  currentPage: number;
  hasNext: boolean;
  hasPrev: boolean;
  lastPage: number | null;
};

export type PaginatedResponse<T> = {
  data: T;
  pagination: PaginationInfo;
};
