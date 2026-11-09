-- Usernames now keep the casing chosen by their owner ("Joris88"), but two
-- accounts must never differ only by case. Prisma cannot express a functional
-- unique index in schema.prisma, so it is declared here. Existing rows are
-- already lowercase (every historical write path normalized them), so the
-- index can be created without a data rewrite.
CREATE UNIQUE INDEX "User_username_lower_key" ON "User" (lower("username"));
