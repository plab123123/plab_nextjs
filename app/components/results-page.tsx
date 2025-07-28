"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ExternalLink, TrendingUp } from "lucide-react"

interface UserPreferences {
  esgValues: { environment: number; social: number; governance: number }
  investmentStyle: string
}

interface Company {
  rank: number
  name: string
  reason: string
  financialData?: string
  financialSummary?: string
}

interface NewsLink {
  title: string
  url: string
}

interface ResultsPageProps {
  userPreferences: UserPreferences
  apiResponse: string
  onBack: () => void
}

const handleReset = () => {
  window.location.reload()
}

const ResultsPage = ({ userPreferences, apiResponse, onBack }: ResultsPageProps) => {
  const [selectedStock, setSelectedStock] = useState<number | null>(null)

  // API 응답 파싱 - 더 정확한 파싱
  const parseApiResponse = (response: string) => {
    const companies: Company[] = []
    const newsLinks: NewsLink[] = []
    let esgSummary = ""

    const esgSummaryMatch = response.match(/📌 \[ESG 요약 분석\]\n([\s\S]*?)\n+(💡|\📊|📰|$)/)

    if (esgSummaryMatch) {
      esgSummary = esgSummaryMatch[1].trim()
    }

    // 기업 정보 파싱 - 개선된 정규식
    const companiesSection = response.split("💡 [추천 투자 기업]")[1]?.split("📰 [관련 기사 목록]")?.[0]

    if (companiesSection) {
      // 각 기업을 개별적으로 파싱
      const companyBlocks = companiesSection.split(/\d+\.\s🏢\s/).filter((block) => block.trim())

      companyBlocks.forEach((block, index) => {
        const lines = block.trim().split("\n")
        const name = lines[0]?.trim()

        // 추천 이유 추출
        const reasonStart = block.indexOf("📌 추천 이유:")
        const reasonEnd = block.indexOf("📊 최근 주요 재무 지표:")

        let reason = ""
        if (reasonStart !== -1) {
          const reasonText =
            reasonEnd !== -1 ? block.substring(reasonStart + 8, reasonEnd) : block.substring(reasonStart + 8)
          reason = reasonText.replace(/📌 추천 이유:\s*/, "").trim()
        }

        // 재무 데이터 추출 (있는 경우)
        let financialData = ""
        let financialSummary = ""

        if (reasonEnd !== -1) {
          const financialSection = block.substring(reasonEnd)
          financialData = financialSection.replace(/📊 최근 주요 재무 지표:\s*/, "").trim()

          // 📈 재무 요약 진단 분리
          const summaryMatch = financialData.match(/📈 재무 요약 진단:(.+)$/s)
          if (summaryMatch) {
            financialSummary = summaryMatch[1].trim()
            // 진단 문구는 financialData에서 제거
            financialData = financialData.replace(/📈 재무 요약 진단:.+$/s, "").trim()
          }
        }


        if (name && reason) {
          companies.push({
            rank: index + 1,
            name: name,
            reason: reason,
            financialData: financialData || undefined,
            financialSummary: financialSummary || undefined
          })
        }
      })
    }

    // 뉴스 링크 파싱
    const newsSection = response.split("📰 [관련 기사 목록]")[1]
    if (newsSection) {
      const newsItems = newsSection.trim().split(/\n(?=\d+\.\s📄)/).filter(Boolean)

      newsItems.forEach((item) => {
        const titleMatch = item.match(/📄\s(.+?)(?:\n|$)/)
        const urlMatch = item.match(/🔗\s(https?:\/\/[^\s]+)/)

        if (titleMatch && urlMatch) {
          newsLinks.push({
            title: titleMatch[1].trim(),
            url: urlMatch[1].trim(),
          })
        }
      })
    }


    return { companies, newsLinks, esgSummary }
  }

  const { companies, newsLinks, esgSummary } = parseApiResponse(apiResponse)

  const isEmptyResult = () => {
    return (
      apiResponse.includes("사용자 요청 없음") ||
      apiResponse.includes("요약 분석 없음") ||
      apiResponse.includes("투자 추천 없음") ||
      apiResponse.includes("관련 기사 없음") ||
      (companies.length === 0 && esgSummary === "" && newsLinks.length === 0)
    )
  }  

  const getESGIcon = (category: string) => {
    switch (category) {
      case "environment":
        return "🌱"
      case "social":
        return "🤝"
      case "governance":
        return "⚖️"
      default:
        return ""
    }
  }

  const getESGLabel = (category: string) => {
    switch (category) {
      case "environment":
        return "환경"
      case "social":
        return "사회"
      case "governance":
        return "지배구조"
      default:
        return ""
    }
  }

  // ESG 비중에 따른 주요 카테고리 결정
  const getMainESGCategories = () => {
    const { environment, social, governance } = userPreferences.esgValues
    const categories = []

    if (environment >= 30) categories.push("environment")
    if (social >= 30) categories.push("social")
    if (governance >= 30) categories.push("governance")

    // 가장 높은 비중 2개 선택
    const sorted = [
      { key: "environment", value: environment },
      { key: "social", value: social },
      { key: "governance", value: governance },
    ].sort((a, b) => b.value - a.value)

    return sorted.slice(0, 2).map((item) => item.key)
  }

  const mainCategories = getMainESGCategories()

  return (
    <div className="py-8 px-4">
      {isEmptyResult() ? (
        <Card className="shadow-lg border-0">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-3xl text-slate-800 flex items-center justify-center gap-3">
            <TrendingUp className="w-8 h-8 text-orange-600" />
            분석 결과를 제공해 드리지 못했어요 😢 
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-slate-600 text-lg leading-relaxed">
            입력하신 조건은 정상적이지만,<br />
            현재 분석 시스템에서 유의미한 결과를 생성하지 못했습니다.
            <br />
            잠시 후 다시 시도해 주시거나, 동일한 조건으로 재분석해 주세요.
          </p>
          <Button size="lg" className="px-8 py-3" onClick={onBack}>
            🔁 이전 화면으로 돌아가기
          </Button>
        </CardContent>
      </Card>
      ) : (
      <div className="max-w-6xl mx-auto space-y-8">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleReset}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800"
          >
            <ChevronLeft className="w-4 h-4" />
            설정으로 돌아가기
          </Button>
          <div className="text-right">
            <p className="text-sm text-slate-500">분석 완료</p>
            <p className="text-lg font-semibold text-slate-800">맞춤 ESG 주식 추천</p>
          </div>
        </div>

        {/* 사용자 설정 요약 */}
        <Card className="shadow-lg border-0 bg-white">
          <CardContent className="p-6">
            <div className="space-y-2 text-sm text-slate-600">
              <h3 className="text-lg font-semibold text-slate-800">분석 기준</h3>
              <p>
                투자 성향:{" "}
                <strong className="text-orange-600">
                  {userPreferences.investmentStyle === "aggressive"
                    ? "공격적"
                    : userPreferences.investmentStyle === "neutral"
                    ? "중립적"
                    : "보수적"}
                </strong>
              </p>
              <p>
                ESG 비중:{" "}
                E <strong className="text-orange-600">{userPreferences.esgValues.environment}%</strong> / 
                S <strong className="text-orange-600">{userPreferences.esgValues.social}%</strong> / 
                G <strong className="text-orange-600">{userPreferences.esgValues.governance}%</strong>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ESG 요약 분석 */}
        {esgSummary && (
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-800 flex items-center gap-2">📌 ESG 요약 분석</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 whitespace-pre-line">{esgSummary}</p>
            </CardContent>
          </Card>
        )}

        {/* 상단: 추천 종목 리스트 */}
        <Card className="shadow-lg border-0">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-3xl text-slate-800 flex items-center justify-center gap-3">
              <TrendingUp className="w-8 h-8 text-orange-600" />📊 AI 추천 종목 TOP {companies.length}
            </CardTitle>
            <p className="text-slate-600">당신의 ESG 선호도와 투자 성향을 바탕으로 AI가 분석한 추천 종목입니다.</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {companies.map((company) => (
                <div
                  key={company.rank}
                  className={`p-6 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedStock === company.rank
                      ? "border-orange-500 bg-orange-50 shadow-md"
                      : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
                  }`}
                  onClick={() => setSelectedStock(selectedStock === company.rank ? null : company.rank)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-12 h-12 bg-orange-600 text-white rounded-full font-bold text-lg">
                        {company.rank}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-slate-800">{company.name}</h3>
                        <p className="text-lg text-slate-500">AI 추천 기업</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {mainCategories.map((category) => (
                        <Badge key={category} variant="secondary" className="flex items-center gap-1">
                          <span>{getESGIcon(category)}</span>
                          <span>{getESGLabel(category)}</span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 하단: 선택된 종목의 상세 정보 */}
        {selectedStock !== null && selectedStock <= companies.length && (
          <Card className="shadow-lg border-0 border-t-4 border-t-orange-500">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-800 flex items-center gap-3">
                📌 {selectedStock}위. {companies[selectedStock - 1].name}
                <Badge variant="outline" className="text-orange-600 border-orange-600">
                  AI 분석 결과
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
            {/* 추천 사유 */}
            <div className="bg-slate-50 rounded-lg p-6 border-2 border-orange-500">
              <h4 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">🤖 AI 추천 사유</h4>
              <p className="text-slate-700 leading-relaxed text-lg whitespace-pre-line">
                {companies[selectedStock - 1].reason}
              </p>
            </div>

            {/* 재무 데이터 (있는 경우) */}
            {companies[selectedStock - 1].financialData && (
              <div className="bg-blue-50 rounded-lg p-6">
                <h4 className="text-lg font-bold text-slate-700 mb-2 flex items-center gap-2">📊 재무 정보</h4>
                <pre className="text-slate-600 leading-relaxed text-sm whitespace-pre-line font-mono">
                {companies[selectedStock - 1].financialData?.replace(/[-\s]*$/g, "").trim() || ""}
              </pre>
              </div>
            )}

            {/* 재무 요약 진단 (있는 경우) */}
            {companies[selectedStock - 1].financialSummary && (
              <div className="bg-blue-50 rounded-lg p-6 mt-4">
                <h4 className="text-xl font-bold text-slate-700 mb-2 flex items-center gap-2">
                  📈 재무 요약 진단
                </h4>
                <p className="text-slate-700 text-lg leading-relaxed whitespace-pre-line">
                  {companies[selectedStock - 1].financialSummary}
                </p>
              </div>
            )}
          </CardContent>
          </Card>
        )}

        {/* 안내 메시지 */}
        {!selectedStock && companies.length > 0 && (
          <Card className="border-dashed border-2 border-slate-300">
            <CardContent className="text-center py-12">
              <p className="text-slate-500 text-lg">
                👆 위의 추천 종목을 클릭하면 상세한 AI 분석 결과를 확인할 수 있습니다.
              </p>
            </CardContent>
          </Card>
        )}

        {/* 뉴스 기사 모음 - 전체 보고서 위에 따로 표시 */}
        {newsLinks.length > 0 && (
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-800 flex items-center gap-2">📰 관련 기사 모음</CardTitle>
              <p className="text-slate-600">AI 추천과 관련된 주요 기사 링크입니다.</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {newsLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 p-4 border border-slate-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-orange-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-slate-800 font-medium">{link.title}</p>
                    <p className="text-sm text-slate-500 mt-1 break-all">{link.url}</p>
                  </div>
                </a>
              ))}
            </CardContent>
          </Card>
        )}


        {/* 전체 AI 분석 결과 (접을 수 있는 형태) */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-800">🤖 전체 AI 분석 보고서</CardTitle>
            <p className="text-slate-600">전체 분석 내용을 확인하려면 클릭하세요.</p>
          </CardHeader>
          <CardContent>
            <details className="group">
              <summary className="cursor-pointer text-orange-600 font-medium hover:text-orange-700 list-none">
                <div className="flex items-center gap-2">
                  <span className="group-open:rotate-90 transition-transform">▶</span>
                  전체 보고서 보기
                </div>
              </summary>
              <div className="mt-4 bg-slate-50 rounded-lg p-6">
                <pre className="whitespace-pre-wrap text-slate-700 leading-relaxed text-sm">{apiResponse}</pre>
              </div>
            </details>
          </CardContent>
        </Card>

        {/* 추가 액션 버튼들 */}
        <div className="flex justify-center gap-4 pt-8">
          <Button size="lg" className="px-8 py-3 bg-orange-600 hover:bg-orange-700">
            📄 분석 보고서 저장
          </Button>
          <Button variant="outline" size="lg" className="px-8 py-3 bg-transparent" onClick={handleReset}>
            🔄 다른 조건으로 분석
          </Button>
        </div>
      </div>
      )
    }
    </div>
  )
}

export default ResultsPage
