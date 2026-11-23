const usersByEmail = new Map();
const usersById = new Map();

export const authStore = {
  findByEmail(email) {
    return usersByEmail.get(email) || null;
  },
  findById(id) {
    return usersById.get(id) || null;
  },
  create(user) {
    usersByEmail.set(user.email, user);
    usersById.set(user.id, user);
    return user;
  },
};
