import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { prisma } from "@repo/database";
import { cmsService } from "./cms.service";

const PUBLIC_READABLE_SECTIONS = new Set([
  "notices",
  "incubations",
  "events",
  "team",
  "gallery",
  "faqs",
  "talks",
]);

const createPublicQuerySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(150).trim(),
  email: z.string().email("Valid email address is required").trim().toLowerCase(),
  phone: z.string().max(30).trim().optional().nullable(),
  domain: z.string().max(120).trim().optional().nullable(),
  subject: z.string().max(120).trim().optional().nullable(),
  stage: z.string().max(80).trim().optional().nullable(),
  message: z.string().min(10, "Message must be at least 10 characters").max(5000).trim(),
});

export const publicMainWebsiteRoutes: FastifyPluginAsync = async (app) => {
  // 1. GET /api/public/home - Aggregated public data for main-website landing page
  app.get("/home", async (_request, reply) => {
    const [notices, incubations, talks, events, gallery, faqs] =
      await Promise.all([
        cmsService.getItems("notices", { active: true }),
        cmsService.getItems("incubations"),
        cmsService.getItems("talks"),
        cmsService.getItems("events"),
        cmsService.getItems("gallery"),
        cmsService.getItems("faqs"),
      ]);

    return reply.send({
      notices,
      incubations,
      talks,
      events,
      gallery,
      faqs,
    });
  });

  // 2. GET /api/public/categories/:module - Public categories for filtering
  app.get("/categories/:module", async (request, reply) => {
    const { module } = request.params as { module: string };
    if (!PUBLIC_READABLE_SECTIONS.has(module)) {
      return reply.status(404).send({ error: "Unknown public category module" });
    }
    const categories = await cmsService.getCategories(module);
    return reply.send({ categories });
  });

  // 3. POST /api/public/queries - Submit public contact / incubation inquiry
  app.post(
    "/queries",
    {
      config: {
        rateLimit: {
          max: 10,
          timeWindow: "1 minute",
        },
      },
    },
    async (request, reply) => {
      const parsed = createPublicQuerySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          success: false,
          error: parsed.error.flatten(),
        });
      }

      const { name, email, phone, domain, subject, stage, message } = parsed.data;

      const created = await prisma.cmsQuery.create({
        data: {
          name,
          email,
          phone: phone || null,
          domain: domain || subject || null,
          stage: stage || null,
          message,
          status: "New",
        },
        select: {
          id: true,
          name: true,
          status: true,
          submittedAt: true,
        },
      });

      return reply.status(201).send({
        success: true,
        message: "Inquiry submitted successfully.",
        query: created,
      });
    },
  );

  // 3b. GET /api/public/teams - Unified public Team Directory (Global, Faculty, and Operational Teams)
  app.get("/teams", async (_request, reply) => {
    const teams = await prisma.team.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      include: {
        members: {
          orderBy: [{ order: "asc" }, { user: { name: "asc" } }],
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                department: true,
                post: true,
                bio: true,
                linkedin: true,
                github: true,
                instagram: true,
              },
            },
          },
        },
      },
    });

    const formatted = teams.map((team) => ({
      id: team.id,
      name: team.name,
      description: team.description,
      type: team.type,
      order: team.order,
      members: team.members.map((m) => ({
        id: m.user.id,
        name: m.user.name,
        email: m.user.email,
        image: m.user.image,
        department: m.user.department,
        position: m.position,
        post: m.position || m.user.post,
        about: m.user.bio,
        linkedin: m.user.linkedin,
        github: m.user.github,
        instagram: m.user.instagram,
        order: m.order,
      })),
    }));

    return reply.send({
      teams: formatted,
      globalTeams: formatted.filter((t) => t.type === "GLOBAL"),
      facultyTeams: formatted.filter((t) => t.type === "FACULTY"),
      operationalTeams: formatted.filter((t) => t.type === "OPERATIONAL"),
    });
  });

  // 4. GET /api/public/:section - Public read for allowlisted CMS sections
  app.get("/:section", async (request, reply) => {
    const { section } = request.params as { section: string };
    if (!PUBLIC_READABLE_SECTIONS.has(section)) {
      return reply.status(404).send({ error: `Public section '${section}' not found` });
    }

    const query = (request.query || {}) as {
      tag?: string;
      category?: string;
      status?: string;
    };

    const items = await cmsService.getItems(section, {
      ...query,
      ...(section === "notices" ? { active: true } : {}),
    });

    return reply.send({ items });
  });

  // 5. GET /api/public/:section/:id - Single public item detail (e.g. /api/public/events/:id)
  app.get("/:section/:id", async (request, reply) => {
    const { section, id } = request.params as { section: string; id: string };
    if (!PUBLIC_READABLE_SECTIONS.has(section)) {
      return reply.status(404).send({ error: `Public section '${section}' not found` });
    }

    const item = await cmsService.getItemById(section, id);
    if (!item) {
      return reply.status(404).send({ error: "Item not found" });
    }
    if (section === "notices" && (item as any).active === false) {
      return reply.status(404).send({ error: "Notice not found" });
    }

    return reply.send({ item });
  });
};
