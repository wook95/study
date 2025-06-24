import { Home, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold">404</CardTitle>
          <CardDescription className="text-lg">
            페이지를 찾을 수 없습니다
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
          </p>

          <div className="flex flex-col space-y-2">
            <Button asChild className="w-full">
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                홈으로 돌아가기
              </Link>
            </Button>

            <Button variant="outline" asChild className="w-full">
              <Link to="/login">로그인 페이지로 이동</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
