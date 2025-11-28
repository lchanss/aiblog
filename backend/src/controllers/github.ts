import type { Request, Response } from "express";
import { fetchGithubData } from "../services/githubApi.js";
import {
  GitHubCommit,
  GitHubPullRequest,
  PRStatus,
  SimplifiedCommit,
  SimplifiedPullRequest,
  SimplifiedPullRequestDetail,
  PaginatedResponse,
} from "../types/github.js";
import { createPaginationInfo } from "../utils/linkHeader.js";

const getPRStatus = (
  state: string,
  draft: boolean,
  mergedAt: string | null
) => {
  switch (true) {
    case draft === true:
      return PRStatus.DRAFT;
    case state === "open":
      return PRStatus.OPEN;
    case mergedAt !== null:
      return PRStatus.MERGED;
    default:
      return PRStatus.CLOSED;
  }
};

type GetPRListParams = {
  owner: string;
  repo: string;
};

type GetPRListQuery = {
  state?: string;
  page?: string;
  per_page?: string;
};

// PR 목록 조회
export const getPRList = async (
  req: Request<GetPRListParams, unknown, unknown, GetPRListQuery>,
  res: Response
) => {
  try {
    const { owner, repo } = req.params;
    const { state = "all", page = "1", per_page = "10" } = req.query;

    // 페이지네이션 파라미터 검증
    const pageNum = parseInt(page, 10);
    const perPageNum = parseInt(per_page, 10);

    if (pageNum < 1 || perPageNum < 1 || perPageNum > 100) {
      res.status(400).json({
        error: "Invalid pagination parameters",
      });
      return;
    }

    const { data, headers } = await fetchGithubData<GitHubPullRequest[]>(
      `/repos/${owner}/${repo}/pulls?state=${state}&page=${pageNum}&per_page=${perPageNum}`
    );

    // PR 데이터 간소화
    const simplified: SimplifiedPullRequest[] = data.map((pr) => ({
      id: pr.id,
      number: pr.number,
      title: pr.title,
      state: pr.state,
      prStatus: getPRStatus(pr.state, pr.draft, pr.merged_at),
      user: {
        login: pr.user.login,
      },
      createdAt: pr.created_at,
      mergedAt: pr.merged_at,
      draft: pr.draft,
    }));

    // 페이지네이션 정보 생성
    const linkHeader = headers.get("link");
    const pagination = createPaginationInfo(linkHeader, pageNum);

    const response: PaginatedResponse<SimplifiedPullRequest[]> = {
      data: simplified,
      pagination,
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching PRs:", error);
    res.status(500).json({ error: "Failed to fetch pull requests" });
  }
};

type GetPRDetailParams = {
  owner: string;
  repo: string;
  pull_number: string;
};

// PR 상세 정보 조회
export const getPRDetail = async (
  req: Request<GetPRDetailParams>,
  res: Response
) => {
  try {
    const { owner, repo, pull_number } = req.params;

    const { data: pr } = await fetchGithubData<GitHubPullRequest>(
      `/repos/${owner}/${repo}/pulls/${pull_number}`
    );

    const simplified: SimplifiedPullRequestDetail = {
      id: pr.id,
      number: pr.number,
      title: pr.title,
      state: pr.state,
      prStatus: getPRStatus(pr.state, pr.draft, pr.merged_at),
      body: pr.body,
      user: {
        login: pr.user.login,
      },
      createdAt: pr.created_at,
      mergedAt: pr.merged_at,
      draft: pr.draft,
      htmlUrl: pr.html_url,
    };

    res.json(simplified);
  } catch (error) {
    console.error("Error fetching PR detail:", error);
    res.status(500).json({ error: "Failed to fetch PR detail" });
  }
};

type GetPRCommitsParams = {
  owner: string;
  repo: string;
  pull_number: string;
};

// PR 커밋 로그 조회
export const getPRCommits = async (
  req: Request<GetPRCommitsParams>,
  res: Response
) => {
  try {
    const { owner, repo, pull_number } = req.params;

    const { data } = await fetchGithubData<GitHubCommit[]>(
      `/repos/${owner}/${repo}/pulls/${pull_number}/commits`
    );

    const simplified: SimplifiedCommit[] = data.map((commit) => ({
      sha: commit.sha,
      message: commit.commit.message,
      author: {
        name: commit.commit.author.name,
        date: commit.commit.author.date,
      },
    }));

    res.json(simplified);
  } catch (error) {
    console.error("Error fetching commits:", error);
    res.status(500).json({ error: "Failed to fetch commits" });
  }
};
