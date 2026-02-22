import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const getStatusColor = (status: string) => {
  switch (status) {
    case "demonstrated":
      return "bg-green-500 hover:bg-green-600"
    case "active":
      return "bg-yellow-500 hover:bg-yellow-600"
    case "ready":
      return "bg-blue-500 hover:bg-blue-600"
    case "blocked":
      return "bg-red-500 hover:bg-red-600"
    default:
      return "bg-gray-500 hover:bg-gray-600"
  }
}

export default function ClaimTracker({
  claims,
}: {
  claims: { id: number; title: string; status: string }[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Patent Claims Tracker</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {claims.map((c) => (
            <div key={c.id} className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Claim {c.id}</span>
                <Badge className={getStatusColor(c.status)}>{c.status}</Badge>
              </div>
              <div className="text-sm font-medium">{c.title}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
