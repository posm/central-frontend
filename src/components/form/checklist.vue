<!--
Copyright 2019 ODK Central Developers
See the NOTICE file at the top-level directory of this distribution and at
https://github.com/opendatakit/central-frontend/blob/master/NOTICE.

This file is part of ODK Central. It is subject to the license terms in
the LICENSE file found in the top-level directory of this distribution and at
https://www.apache.org/licenses/LICENSE-2.0. No part of ODK Central,
including this file, may be copied, modified, propagated, or distributed
except according to the terms contained in the LICENSE file.
-->
<template>
  <page-section>
    <template #heading>
      <span>Checklist</span>
    </template>
    <template #body>
      <form-checklist-step :stage="stepStage(0)">
        <template #title>Create and upload Form</template>
        <p>
          <strong>Great work!</strong> Your Form design has been loaded
          successfully. It is ready to accept Submissions. You will have to
          start over with a new Form if you wish to make changes to the Form
          questions.
          <doc-link to="central-forms/#uploading-a-form-to-odk-central">
            Click here to find out more.
          </doc-link>
        </p>
      </form-checklist-step>
      <!-- Using v-show rather than v-if so that the number of steps is
      consistent, which makes testing easier. -->
      <form-checklist-step v-show="attachments.length !== 0"
        :stage="stepStage(1)">
        <template #title>Upload Form media files</template>
        <p>
          Your Form design references files that we need in order to present
          your Form. You can upload these for distribution under the
          <router-link :to="formPath('media-files')">
            <!-- eslint-disable-next-line vue/multiline-html-element-content-newline -->
            Media Files tab</router-link>.
          If you change your mind or make a mistake, you can always replace the
          files.
          <doc-link to="central-forms/#forms-with-attachments">
            Click here to find out more.
          </doc-link>
        </p>
      </form-checklist-step>
      <form-checklist-step :stage="stepStage(2)">
        <template #title>Download Form on survey clients and submit data</template>
        <p>
          <template v-if="form.submissions === 0">
            Nobody has submitted any data to this Form yet.
          </template>
          <template v-else-if="form.submissions === 1">
            A total of 1 Submission has been sent to this server.
          </template>
          <template v-else>
            A total of {{ form.submissions.toLocaleString() }} Submissions have
            been sent to this server.
          </template>
          App Users will be able to see this Form on their mobile device to
          download and fill out.
          <template v-if="project.appUsers === 0">
            <strong>You have not created any App Users for this Project yet, so
            nobody will be able to use this Form.</strong> You can create them
            on the
            <router-link :to="`/projects/${project.id}/app-users`">
              <!-- eslint-disable-next-line vue/multiline-html-element-content-newline -->
              App Users tab of the Project page</router-link>.
          </template>
          <template v-else>
            Right now,
            <strong>
              <router-link :to="`/projects/${project.id}/form-access`">
                <!-- eslint-disable-next-line vue/multiline-html-element-content-newline -->
                {{ $pluralize('App User', assignmentActors.length, true) }}</router-link>
            </strong>
            in this Project {{ $pluralize('has', assignmentActors.length) }}
            access to this Form, but you can always
            <router-link :to="`/projects/${project.id}/app-users`">
              <!-- eslint-disable-next-line vue/multiline-html-element-content-newline -->
              add more.</router-link>
          </template>
          For more information about this,
          <doc-link to="central-submissions/">click here</doc-link>.
        </p>
      </form-checklist-step>
      <form-checklist-step :stage="stepStage(3)">
        <template #title>Evaluate and analyze submitted data</template>
        <p>
          <template v-if="form.submissions === 0">
            Once there is data for this Form, you can export or synchronize it
            to monitor and analyze the data for quality and results.
          </template>
          <template v-else>
            You can export or synchronize the
            {{ $pluralize('Submission', form.submissions, true) }} on this Form
            to monitor and analyze them for quality and results.
          </template>
          You can do this with the Download and Analyze buttons on the
          <router-link :to="formPath('submissions')">
            <!-- eslint-disable-next-line vue/multiline-html-element-content-newline -->
            Submissions tab</router-link>.
          <doc-link to="central-submissions/">
            Click here to find out more.
          </doc-link>
        </p>
      </form-checklist-step>
      <form-checklist-step :stage="stepStage(4)">
        <template #title>Manage Form retirement</template>
        <p>
          As you come to the end of your data collection, you can use the Form
          Lifecycle controls on
          <router-link :to="formPath('settings')">
            <!-- eslint-disable-next-line vue/multiline-html-element-content-newline -->
            this Form&rsquo;s Settings tab</router-link>
          to control whether, for example, App Users will be able to see or
          create new Submissions to this Form.
          <doc-link to="central-forms/#managing-form-lifecycle">
            Click here to find out more.
          </doc-link>
        </p>
      </form-checklist-step>
    </template>
  </page-section>
</template>

<script>
import DocLink from '../doc-link.vue';
import FormChecklistStep from './checklist-step.vue';
import PageSection from '../page/section.vue';
import { requestData } from '../../store/modules/request';

export default {
  name: 'FormChecklist',
  components: { DocLink, FormChecklistStep, PageSection },
  computed: {
    ...requestData(['project', 'form', 'attachments', 'assignmentActors']),
    // Returns true if all form attachments exist and false if not. Returns true
    // if there are no form attachments.
    allAttachmentsExist() {
      return this.attachments.every(attachment => attachment.exists);
    },
    // Indicates whether each step is complete.
    stepCompletion() {
      return [
        true,
        this.allAttachmentsExist,
        this.form.submissions !== 0,
        false,
        this.form.state !== 'open'
      ];
    },
    currentStep() {
      return this.stepCompletion.findIndex(isComplete => !isComplete);
    }
  },
  methods: {
    stepStage(step) {
      if (step === this.currentStep) return 'current';
      if (this.stepCompletion[step]) return 'complete';
      return 'later';
    },
    formPath(suffix) {
      return `/projects/${this.project.id}/forms/${this.form.encodedId()}/${suffix}`;
    }
  }
};
</script>
