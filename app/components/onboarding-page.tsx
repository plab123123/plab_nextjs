"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

interface OnboardingPageProps {
  esgValues: { environment: number; social: number; governance: number }
  setEsgValues: (values: { environment: number; social: number; governance: number }) => void
  investmentStyle: string
  setInvestmentStyle: (style: string) => void
  onSubmit: () => void
  isFormValid: boolean
  isLoading: boolean
  handleSliderChange: (category: "environment" | "social" | "governance", newValue: number) => void
}

const OnboardingPage = ({
  esgValues,
  investmentStyle,
  setInvestmentStyle,
  onSubmit,
  isFormValid,
  isLoading,
  handleSliderChange,
}: OnboardingPageProps) => {
  return (
    <div className="py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* 제목 */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-slate-800 leading-tight">
            나의 투자 가치에 맞춘
            <br />
            <span className="text-orange-600">ESG AI 주식 추천</span>
          </h1>
          <p className="text-lg text-slate-600">
            당신의 가치관과 투자 성향을 분석하여 최적의 ESG 주식을 추천해드립니다!
          </p>
        </div>

        {/* ESG 우선순위 슬라이더 */}
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl text-slate-800">ESG 우선순위 설정</CardTitle>
            <p className="text-slate-600">
              ESG 각각의 항목에 대해 본인의 중요도를 설정해 주세요. 총 합이 100%가 되도록 설정됩니다.
            </p>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* 환경 (Environment) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🟩</span>
                  <Label className="text-lg font-medium text-slate-700">환경 (Environment)</Label>
                </div>
                <div className="text-2xl font-bold text-green-600">{esgValues.environment}%</div>
              </div>
              <Slider
                value={[esgValues.environment]}
                onValueChange={(value) => handleSliderChange("environment", value[0])}
                max={100}
                step={1}
                className="w-full"
              />
            </div>

            {/* 사회 (Social) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🟦</span>
                  <Label className="text-lg font-medium text-slate-700">사회 (Social)</Label>
                </div>
                <div className="text-2xl font-bold text-blue-600">{esgValues.social}%</div>
              </div>
              <Slider
                value={[esgValues.social]}
                onValueChange={(value) => handleSliderChange("social", value[0])}
                max={100}
                step={1}
                className="w-full"
              />
            </div>

            {/* 지배구조 (Governance) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🟥</span>
                  <Label className="text-lg font-medium text-slate-700">지배구조 (Governance)</Label>
                </div>
                <div className="text-2xl font-bold text-red-500">{esgValues.governance}%</div>
              </div>
              <Slider
                value={[esgValues.governance]}
                onValueChange={(value) => handleSliderChange("governance", value[0])}
                max={100}
                step={1}
                className="w-full"
              />
            </div>

            {/* 총합 표시 */}
            <div className="bg-slate-50 rounded-lg p-4 border-2 border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium text-slate-700">총 합</span>
                <span className="text-2xl font-bold text-slate-800">
                  {esgValues.environment + esgValues.social + esgValues.governance}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 투자 성향 선택 */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-800">투자 성향 선택</CardTitle>
            <p className="text-slate-600">당신의 투자 성향은 어떤 쪽에 가까우신가요?</p>
          </CardHeader>
          <CardContent>
            <RadioGroup value={investmentStyle} onValueChange={setInvestmentStyle}>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center space-x-2 p-4 border-2 border-slate-200 rounded-lg hover:border-orange-300 transition-colors">
                  <RadioGroupItem value="aggressive" id="aggressive" />
                  <Label htmlFor="aggressive" className="text-lg cursor-pointer">
                    공격적
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-4 border-2 border-slate-200 rounded-lg hover:border-orange-300 transition-colors">
                  <RadioGroupItem value="neutral" id="neutral" />
                  <Label htmlFor="neutral" className="text-lg cursor-pointer">
                    중립적
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-4 border-2 border-slate-200 rounded-lg hover:border-orange-300 transition-colors">
                  <RadioGroupItem value="conservative" id="conservative" />
                  <Label htmlFor="conservative" className="text-lg cursor-pointer">
                    보수적
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* 제출 버튼 */}
        <div className="text-center pt-8">
          <Button
            onClick={onSubmit}
            disabled={!isFormValid || isLoading}
            size="lg"
            className="px-12 py-4 text-lg font-semibold bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300"
          >
            {isLoading ? "AI 분석 중..." : "맞춤 분석 시작하기"}
          </Button>
          {!isFormValid && <p className="text-sm text-slate-500 mt-2">투자 성향을 선택해 주세요</p>}
        </div>
      </div>
    </div>
  )
}

export default OnboardingPage
