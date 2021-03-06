import { omit } from 'ramda';

import faker from '../faker';
import { dataStore, view } from './data-store';
import { extendedUsers } from './users';
import { standardRoles } from './roles';

const verbsForUserAndRole = (extendedUser, roleSystem) => {
  const verbs = new Set(extendedUser.verbs);

  if (roleSystem !== 'none') {
    const role = standardRoles.sorted().find(r => r.system === roleSystem);
    if (role == null) throw new Error('role not found');
    for (const verb of role.verbs)
      verbs.add(verb);
  }

  return Array.from(verbs);
};

export const extendedProjects = dataStore({
  factory: ({
    inPast,
    id,
    lastCreatedAt,

    name = faker.name.findName(),
    archived = false,
    // The default value of this property does not necessarily match
    // testData.extendedForms.
    forms = inPast ? faker.random.number() : 0,
    // The default value of this property does not necessarily match
    // testData.extendedFieldKeys.
    appUsers = inPast ? faker.random.number() : 0,
    lastSubmission = undefined,
    key = null,
    // The current user's role on the project
    role = 'none'
  }) => {
    const { createdAt, updatedAt } = faker.date.timestamps(inPast, [
      lastCreatedAt
    ]);

    if (extendedUsers.size === 0) throw new Error('user not found');
    const verbs = verbsForUserAndRole(extendedUsers.first(), role);

    const project = {
      id,
      name,
      archived,
      keyId: key != null ? key.id : null,
      createdAt,
      updatedAt,
      // Extended metadata
      forms,
      appUsers,
      verbs
    };

    if (lastSubmission !== undefined) {
      project.lastSubmission = lastSubmission;
    } else {
      // This property does not necessarily match testData.extendedSubmissions.
      project.lastSubmission = forms !== 0 && faker.random.boolean()
        ? faker.date.pastSince(createdAt).toISOString()
        : null;
    }

    return project;
  },
  sort: (project1, project2) => project1.name.localeCompare(project2.name)
});

export const standardProjects = view(
  extendedProjects,
  omit(['forms', 'lastSubmission', 'appUsers', 'verbs'])
);
