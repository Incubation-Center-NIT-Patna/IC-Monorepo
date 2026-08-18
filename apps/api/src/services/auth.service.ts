import { prisma } from "@repo/database";

export class AuthService {
  async loginWithPhone(phoneNumber: string) {
    let user = await prisma.user.findUnique({ where: { phoneNumber } });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;

      user = await prisma.user.create({
        data: {
          id: crypto.randomUUID(),
          phoneNumber,
          phoneNumberVerified: true,
          emailVerified: false,
          name: "",
        },
      });
    } else if (!user.phoneNumberVerified) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          phoneNumberVerified: true,
        },
      });
    }

    return {
      user,
      isNewUser,
    };
  }
}

export const authService = new AuthService();
