import { type RouteConfig, layout, route, index } from "@react-router/dev/routes";

export default [
    layout('routes/admin/admin-layout.tsx', [
        index('routes/admin/dashboard.tsx'),
        route('all-users', 'routes/admin/all-users.tsx'),
    ]),
] satisfies RouteConfig;