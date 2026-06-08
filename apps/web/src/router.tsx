import { createRootRoute, createRoute } from "@tanstack/react-router"
import { Outlet } from "@tanstack/react-router"
import { indexRoute } from "./routes/index"

const rootRoute = createRootRoute({
  component: () => <Outlet />,
})

const routeTree = rootRoute.addChildren([
  createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: indexRoute,
  }),
])

export { routeTree }
