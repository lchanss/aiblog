import { useSearchParams } from "react-router";

import { useQueryPullRequests } from "@/features/search/api/useQueryPullRequests";
import RepositorySearchBar from "@/features/search/components/RepositorySearchBar";
import SearchResult from "@/features/search/components/SearchResult";
import Divider from "@/shared/ui/Divider";
import { ErrorFallback, LoadingFallback } from "@/shared/ui/Fallback";
import Pagination from "@/shared/ui/Pagination";

const DEFAULT_PAGE = 1;

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const owner = searchParams.get("owner") ?? "";
  const repository = searchParams.get("repository") ?? "";
  const page = parsePageNumber(searchParams.get("page"), DEFAULT_PAGE);

  const hasSearchParams = owner !== "" && repository !== "";

  const { data, status } = useQueryPullRequests({
    params: { owner, repository, page },
    queryConfig: { enabled: hasSearchParams },
  });

  const handleSearch = (owner: string, repository: string) => {
    if (owner === "" || repository === "") {
      alert("owner와 repository를 모두 입력해주세요.");
      return;
    }
    setSearchParams({
      owner,
      repository,
      page: DEFAULT_PAGE.toString(), // 새 검색 시 기본 페이지로
    });
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams({
      owner,
      repository,
      page: newPage.toString(),
    });
  };

  return (
    <div className="p-8">
      <div className="space-y-8 p-10">
        <RepositorySearchBar initValues={{ owner, repository }} onSearch={handleSearch} />
        <Divider />
        {hasSearchParams ? (
          <>
            {status === "pending" && <LoadingFallback message="PR 목록을 불러오는 중..." />}
            {status === "error" && <ErrorFallback />}
            {status === "success" && (
              <div className="space-y-6">
                <SearchResult owner={owner} repository={repository} pullRequests={data.data} />
                <Pagination pagination={data.pagination} onPageChange={handlePageChange} />
              </div>
            )}
          </>
        ) : (
          <div>레포지토리를 검색해보세요.</div>
        )}
      </div>
    </div>
  );
}

const parsePageNumber = (value: string | null, defaultValue: number): number => {
  if (!value) return defaultValue;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? defaultValue : parsed;
};
