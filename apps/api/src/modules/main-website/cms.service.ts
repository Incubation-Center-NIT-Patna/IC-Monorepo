import { z } from "zod";
import { prisma } from "@repo/database";

export interface ActorInfo {
  id: string;
  name?: string | null;
  role?: string | null;
  email?: string | null;
}

const safeUrl = z
  .string()
  .trim()
  .refine(
    (v) =>
      v === "" ||
      v === "#" ||
      v.startsWith("https://") ||
      v.startsWith("http://") ||
      v.startsWith("/"),
    { message: "URL must start with https://, http://, /, or #" },
  );

const sectionCreateSchemas: Record<string, z.ZodType<any>> = {
  notices: z.object({
    title: z.string().min(1, "Title is required").max(300).trim(),
    tag: z.string().min(1).max(80).trim().default("General Notice"),
    date: z.string().min(1).max(60).trim(),
    active: z.boolean().default(true),
    priority: z.string().max(40).trim().default("Normal"),
    link: safeUrl.optional().nullable(),
    description: z.string().max(5000).optional().nullable(),
  }),
  incubations: z.object({
    name: z.string().min(1).max(200).trim(),
    founder: z.string().min(1).max(200).trim(),
    sector: z.string().min(1).max(120).trim(),
    status: z.string().max(60).trim().default("Incubated"),
    funding: z.string().max(120).trim().optional().nullable(),
    website: safeUrl.optional().nullable(),
    image: safeUrl.optional().nullable(),
    description: z.string().max(5000).optional().nullable(),
    order: z.coerce.number().int().default(0),
  }),
  events: z.object({
    title: z.string().min(1).max(250).trim(),
    category: z.string().max(80).trim().default("Flagship Event"),
    date: z.string().min(1).max(60).trim(),
    time: z.string().max(80).trim().optional().nullable(),
    venue: z.string().max(200).trim().optional().nullable(),
    status: z.string().max(60).trim().default("Upcoming"),
    registrationLink: safeUrl.optional().nullable(),
    image: safeUrl.optional().nullable(),
    description: z.string().max(10000).optional().nullable(),
  }),
  team: z.object({
    name: z.string().min(1).max(150).trim(),
    category: z.string().max(60).trim().default("faculty"),
    post: z.string().min(1).max(150).trim(),
    email: z.string().email().optional().nullable().or(z.literal("")),
    department: z.string().max(150).trim().optional().nullable(),
    image: safeUrl.optional().nullable(),
    about: z.string().max(3000).optional().nullable(),
    order: z.coerce.number().int().default(0),
  }),
  gallery: z.object({
    title: z.string().min(1).max(200).trim(),
    category: z.string().max(80).trim().default("Events"),
    url: safeUrl.refine((v) => v.length > 0, { message: "Image URL is required" }),
    date: z.string().max(60).trim().optional().nullable(),
  }),
  faqs: z.object({
    question: z.string().min(1).max(500).trim(),
    category: z.string().max(80).trim().default("General"),
    answer: z.string().min(1).max(5000).trim(),
    order: z.coerce.number().int().default(0),
  }),
  talks: z.object({
    name: z.string().min(1).max(150).trim(),
    role: z.string().min(1).max(200).trim(),
    photo: safeUrl.optional().nullable(),
    content: z.string().min(1).max(8000).trim(),
    order: z.coerce.number().int().default(0),
  }),
  queries: z.object({
    name: z.string().min(1).max(150).trim(),
    email: z.string().email(),
    phone: z.string().max(30).trim().optional().nullable(),
    domain: z.string().max(120).trim().optional().nullable(),
    stage: z.string().max(80).trim().optional().nullable(),
    message: z.string().min(1).max(5000).trim(),
    status: z.enum(["New", "Contacted", "Reviewed", "Archived"]).default("New"),
    reply: z.string().max(5000).optional().nullable(),
  }),
};

function validateSectionPayload(section: string, rawData: any, isUpdate = false) {
  const schema = sectionCreateSchemas[section];
  if (!schema) {
    throw new Error(`Unknown CMS section: ${section}`);
  }
  const effectiveSchema = isUpdate ? (schema as z.ZodObject<any>).partial() : schema;
  const parsed = effectiveSchema.safeParse(rawData);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    throw new Error(
      firstIssue
        ? `${firstIssue.path.join(".") || "Payload"}: ${firstIssue.message}`
        : "Invalid CMS payload",
    );
  }
  return parsed.data;
}

export const cmsService = {
  // 1. Generic Section Operations
  async getItems(
    section: string,
    query: { tag?: string; category?: string; status?: string; active?: boolean } = {},
  ) {
    switch (section) {
      case "notices":
        return prisma.cmsNotice.findMany({
          where: {
            ...(query.tag ? { tag: query.tag } : {}),
            ...(query.active !== undefined ? { active: query.active } : {}),
          },
          orderBy: { createdAt: "desc" },
        });

      case "incubations":
        return prisma.cmsIncubation.findMany({
          where: {
            ...(query.status ? { status: query.status } : {}),
          },
          orderBy: { order: "asc" },
        });

      case "events":
        return prisma.cmsEvent.findMany({
          where: {
            ...(query.status ? { status: query.status } : {}),
            ...(query.category ? { category: query.category } : {}),
          },
          orderBy: { createdAt: "desc" },
        });

      case "team":
        return prisma.cmsTeamMember.findMany({
          where: {
            ...(query.category ? { category: query.category } : {}),
          },
          orderBy: { order: "asc" },
        });

      case "gallery":
        return prisma.cmsGalleryItem.findMany({
          where: {
            ...(query.category ? { category: query.category } : {}),
          },
          orderBy: { createdAt: "desc" },
        });

      case "faqs":
        return prisma.cmsFaq.findMany({
          where: {
            ...(query.category ? { category: query.category } : {}),
          },
          orderBy: { order: "asc" },
        });

      case "talks":
        return prisma.cmsTalk.findMany({
          orderBy: { order: "asc" },
        });

      case "queries":
        return prisma.cmsQuery.findMany({
          where: {
            ...(query.status ? { status: query.status } : {}),
          },
          orderBy: { createdAt: "desc" },
        });

      default:
        throw new Error(`Unknown CMS section: ${section}`);
    }
  },

  async getItemById(section: string, id: string) {
    switch (section) {
      case "notices":
        return prisma.cmsNotice.findUnique({ where: { id } });
      case "incubations":
        return prisma.cmsIncubation.findUnique({ where: { id } });
      case "events":
        return prisma.cmsEvent.findUnique({ where: { id } });
      case "team":
        return prisma.cmsTeamMember.findUnique({ where: { id } });
      case "gallery":
        return prisma.cmsGalleryItem.findUnique({ where: { id } });
      case "faqs":
        return prisma.cmsFaq.findUnique({ where: { id } });
      case "talks":
        return prisma.cmsTalk.findUnique({ where: { id } });
      case "queries":
        return prisma.cmsQuery.findUnique({ where: { id } });
      default:
        throw new Error(`Unknown CMS section: ${section}`);
    }
  },

  async createItem(section: string, rawData: any, actor: ActorInfo) {
    const data = validateSectionPayload(section, rawData, false);
    let created: any;
    let label = "";

    switch (section) {
      case "notices":
        created = await prisma.cmsNotice.create({ data });
        label = `Notice: ${created.title}`;
        break;
      case "incubations":
        created = await prisma.cmsIncubation.create({ data });
        label = `Startup: ${created.name}`;
        break;
      case "events":
        created = await prisma.cmsEvent.create({ data });
        label = `Event: ${created.title}`;
        break;
      case "team":
        created = await prisma.cmsTeamMember.create({ data });
        label = `Team Member: ${created.name}`;
        break;
      case "gallery":
        created = await prisma.cmsGalleryItem.create({ data });
        label = `Gallery Item: ${created.title}`;
        break;
      case "faqs":
        created = await prisma.cmsFaq.create({ data });
        label = `FAQ: ${created.question.slice(0, 30)}`;
        break;
      case "talks":
        created = await prisma.cmsTalk.create({ data });
        label = `Talk: ${created.name}`;
        break;
      case "queries":
        created = await prisma.cmsQuery.create({ data });
        label = `Inquiry: ${created.name}`;
        break;
      default:
        throw new Error(`Unknown CMS section: ${section}`);
    }

    await prisma.systemActivityLog.create({
      data: {
        userId: actor.id,
        userName: actor.name || actor.email || "Administrator",
        userRole: actor.role || "Admin",
        action: `Created new ${label}`,
        category: section.charAt(0).toUpperCase() + section.slice(1),
        type: "cms-update",
        status: "Created",
      },
    });

    return created;
  },

  async updateItem(section: string, id: string, rawData: any, actor: ActorInfo) {
    const data = validateSectionPayload(section, rawData, true);
    let updated: any;
    let label = "";

    switch (section) {
      case "notices":
        updated = await prisma.cmsNotice.update({ where: { id }, data });
        label = `Notice: ${updated.title}`;
        break;
      case "incubations":
        updated = await prisma.cmsIncubation.update({ where: { id }, data });
        label = `Startup: ${updated.name}`;
        break;
      case "events":
        updated = await prisma.cmsEvent.update({ where: { id }, data });
        label = `Event: ${updated.title}`;
        break;
      case "team":
        updated = await prisma.cmsTeamMember.update({ where: { id }, data });
        label = `Team Member: ${updated.name}`;
        break;
      case "gallery":
        updated = await prisma.cmsGalleryItem.update({ where: { id }, data });
        label = `Gallery Item: ${updated.title}`;
        break;
      case "faqs":
        updated = await prisma.cmsFaq.update({ where: { id }, data });
        label = `FAQ: ${updated.question.slice(0, 30)}`;
        break;
      case "talks":
        updated = await prisma.cmsTalk.update({ where: { id }, data });
        label = `Talk: ${updated.name}`;
        break;
      case "queries":
        updated = await prisma.cmsQuery.update({
          where: { id },
          data: {
            ...data,
            ...(data.reply !== undefined ? { repliedAt: new Date() } : {}),
          },
        });
        label = `Inquiry: ${updated.name}`;
        break;
      default:
        throw new Error(`Unknown CMS section: ${section}`);
    }

    await prisma.systemActivityLog.create({
      data: {
        userId: actor.id,
        userName: actor.name || actor.email || "Administrator",
        userRole: actor.role || "Admin",
        action: `Updated ${label}`,
        category: section.charAt(0).toUpperCase() + section.slice(1),
        type: "cms-update",
        status: "Updated",
      },
    });

    return updated;
  },

  async deleteItem(section: string, id: string, actor: ActorInfo) {
    let deleted: any;

    switch (section) {
      case "notices":
        deleted = await prisma.cmsNotice.delete({ where: { id } });
        break;
      case "incubations":
        deleted = await prisma.cmsIncubation.delete({ where: { id } });
        break;
      case "events":
        deleted = await prisma.cmsEvent.delete({ where: { id } });
        break;
      case "team":
        deleted = await prisma.cmsTeamMember.delete({ where: { id } });
        break;
      case "gallery":
        deleted = await prisma.cmsGalleryItem.delete({ where: { id } });
        break;
      case "faqs":
        deleted = await prisma.cmsFaq.delete({ where: { id } });
        break;
      case "talks":
        deleted = await prisma.cmsTalk.delete({ where: { id } });
        break;
      case "queries":
        deleted = await prisma.cmsQuery.delete({ where: { id } });
        break;
      default:
        throw new Error(`Unknown CMS section: ${section}`);
    }

    await prisma.systemActivityLog.create({
      data: {
        userId: actor.id,
        userName: actor.name || actor.email || "Administrator",
        userRole: actor.role || "Admin",
        action: `Deleted item from ${section} (ID: ${id})`,
        category: section.charAt(0).toUpperCase() + section.slice(1),
        type: "cms-update",
        status: "Deleted",
      },
    });

    return deleted;
  },

  // 2. Dynamic Categories
  async getCategories(moduleName: string) {
    const categories = await prisma.cmsCategory.findMany({
      where: { module: moduleName },
      orderBy: { name: "asc" },
    });
    return categories.map((c) => c.name);
  },

  async addCategory(moduleName: string, name: string, actor: ActorInfo) {
    const clean = name.trim();
    if (!clean) throw new Error("Category name cannot be empty");

    const category = await prisma.cmsCategory.upsert({
      where: {
        module_name: {
          module: moduleName,
          name: clean,
        },
      },
      update: {},
      create: {
        module: moduleName,
        name: clean,
      },
    });

    await prisma.systemActivityLog.create({
      data: {
        userId: actor.id,
        userName: actor.name || actor.email || "Administrator",
        userRole: actor.role || "Admin",
        action: `Added category "${clean}" to ${moduleName}`,
        category: "Settings",
        type: "settings-updated",
        status: "Created",
      },
    });

    return category;
  },

  async deleteCategory(moduleName: string, name: string, actor: ActorInfo) {
    const deleted = await prisma.cmsCategory.deleteMany({
      where: {
        module: moduleName,
        name,
      },
    });

    await prisma.systemActivityLog.create({
      data: {
        userId: actor.id,
        userName: actor.name || actor.email || "Administrator",
        userRole: actor.role || "Admin",
        action: `Deleted category "${name}" from ${moduleName}`,
        category: "Settings",
        type: "settings-updated",
        status: "Deleted",
      },
    });

    return deleted;
  },

  // 4. Aggregated Stats
  async getStats() {
    const [
      activeNotices,
      totalIncubations,
      graduatedStartups,
      upcomingEvents,
      totalMentors,
      totalStudents,
      pendingQueries,
      totalUsers,
      totalApplications,
    ] = await Promise.all([
      prisma.cmsNotice.count({ where: { active: true } }),
      prisma.cmsIncubation.count(),
      prisma.cmsIncubation.count({ where: { status: "Graduated" } }),
      prisma.cmsEvent.count({ where: { status: "Upcoming" } }),
      prisma.cmsTeamMember.count({ where: { category: "faculty" } }),
      prisma.cmsTeamMember.count({ where: { category: "student" } }),
      prisma.cmsQuery.count({ where: { status: "New" } }),
      prisma.user.count(),
      prisma.application.count(),
    ]);

    return {
      activeNotices,
      totalIncubations,
      graduatedStartups,
      upcomingEvents,
      totalMentors,
      totalStudents,
      pendingQueries,
      totalUsers,
      totalApplications,
    };
  },
};
