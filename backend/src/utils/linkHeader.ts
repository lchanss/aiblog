import { PaginationInfo } from "../types/github.js";

export interface ParsedLink {
  next?: string;
  prev?: string;
  first?: string;
  last?: string;
}

/**
 * GitHub API Link 헤더를 파싱합니다
 * @example
 * Link: <https://api.github.com/repos/owner/repo/pulls?page=2>; rel="next"
 */
export function parseLinkHeader(header: string | null): ParsedLink {
  if (!header) return {};

  const links: ParsedLink = {};
  const parts = header.split(",");

  parts.forEach((part) => {
    const section = part.split(";");
    if (section.length !== 2) return;

    const url = section[0].replace(/<(.*)>/, "$1").trim();
    const relMatch = section[1].match(/rel="(.*)"/);

    if (relMatch) {
      const rel = relMatch[1] as keyof ParsedLink;
      links[rel] = url;
    }
  });

  return links;
}

/**
 * URL에서 페이지 번호를 추출합니다
 */
export function extractPageNumber(url: string): number {
  const match = url.match(/[?&]page=(\d+)/);
  return match ? parseInt(match[1], 10) : 1;
}

/**
 * 페이지네이션 정보를 생성합니다
 */
export function createPaginationInfo(
  linkHeader: string | null,
  currentPage: number
): PaginationInfo {
  const links = parseLinkHeader(linkHeader);

  return {
    currentPage,
    hasNext: !!links.next,
    hasPrev: !!links.prev,
    lastPage: links.last ? extractPageNumber(links.last) : null,
  };
}
