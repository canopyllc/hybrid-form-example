<template>
  <textarea
    ref="editor"
    v-model="content"
    name="content"
  />
</template>

<script>
/**
 * Froala is a WYSIWYG HTML Editor
 * @see https://froala.com/
 */

// this works... not sure how though - need to get rid of js include if we use this
import FroalaEditor from 'froala-editor';
import 'froala-editor/js/plugins/lists.min';
import 'froala-editor/js/plugins/link.min';
import 'froala-editor/js/plugins/colors.min';
import 'froala-editor/js/plugins/table.min';
import 'froala-editor/js/plugins/image.min';
import {v4 as uuidv4} from 'uuid';
import {objectToFormData} from '@/js/utils/api';
import {imageFileExtensions, imageMaxSize, uploadType} from '@/js/enums/api';
import {error as errorPrompt, confirmPrompt} from '@/js/utils/sweetAlert2';
import {isObject} from '@/js/utils/javascript';

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Froala',
  props: {
    options: {
      type: Object,
      default: () => ({}),
    },
    value: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
    },
    // WARNING - NOT REACTIVE, MUST BE SET AT INVOCATION
    placeholder: {
      type: String,
      default: '',
    },
  },
  emits: ['input', 'addImage', 'removeImage', 'resizeImage'],
  data() {
    return {
      content: this.value,
      imageElementList: [],
      editor: null,
    };
  },
  watch: {
    disabled() {
      this.updateDisabled();
    },
  },
  async mounted() {
    const self = this, // the only justified use of this - do not repeat
          optionOverrides = this.options,
          newOptions = {
            imageMaxSize,
            imageAllowedTypes: imageFileExtensions,
            iconsTemplate: 'font_awesome_5',
            imageStyles: {'rounded-lg': 'Rounded', border: 'Bordered', shadow: 'Shadow'},
            imageEditButtons: ['imageAlign', 'imageCaption', 'imageAlt', 'imageRemove', '-',
              'imageDisplay', 'imageStyle', 'imageLink', 'linkOpen', 'linkEdit', 'linkRemove'],
            toolbarButtons: ['undo', 'redo', '|', 'bold', 'italic', 'underline', '|',
              'clearFormatting', '|', 'formatUL', 'formatOL', 'insertLink', 'insertTable'],
            heightMin: 0,
            editorClass: 'c-rte',
            /**
             * Setup tables:
             * 1. remove tableCellStyle from tableEditButtons
             * 2. add custom table styles buttons for  bordered and condensed
             * 3. Listen for table inserted event to add the table bootstrap class to new tables.
             */
            tableEditButtons: ['tableHeader', 'tableRemove', '|', 'tableRows', 'tableColumns', 'tableStyle', '-',
              'tableCells', 'tableCellBackground', 'tableCellVerticalAlign', 'tableCellHorizontalAlign'],
            tableStyles: {
              'table-bordered': 'Bordered',
              'table-condensed': 'Condensed',
            },
            attribution: false,
            key: 'WE1B5dG3G4G3A8B8C6cWHNGGDTCWHIg1Ee1Oc2Yc1b1Lg1POkB6B5F5C4F3D3A2F2A5C3==',
            ...(this.placeholder && {placeholderText: this.placeholder}),
            ...optionOverrides,

            events: {
              // defaults
              initialized() {
                // disable froala editor or not
                self.updateDisabled();

                // Add classes applied at parent level to the froala editor element
                // - froala hides the original textarea field with those styles
                // The original reason for adding this logic was to support inputClass in the RichTextComponent.vue
                //
                // support static strings, dynamic string, array of classes or object notation for conditional classes
                // @todo make sure object notation works if it reactively changes - think it might not
                const classes = self.$attrs.class, // can't destructure class reserved word
                      classListItems = [
                        ...(typeof classes === 'string' && classes !== '' ? classes.split(' ') : []),
                        ...(Array.isArray(classes) ? classes : []),
                        ...(isObject(classes)
                          ? Object.entries(classes).map(([k, v]) => (v ? k : false)).filter((k) => k)
                          : []),
                      ];
                if (classListItems.length === 0) return; // short circuit if no classes
                // "this" is editor
                Array.from(this.$box).forEach((box) => {
                  box.classList.add(...classListItems);
                });
              },
              contentChanged() {
                // 'this' is the editor instance.
                self.content = this.html.get(true);
                self.$emit('input', self.content);
              },
              'table.inserted': function(table) {
                // this is the editor instance.
                table.classList.add('table', 'table-bordered', 'table-condensed');
              },
              'image.beforeUpload': function(imagesFileList) {
                const editor = this,
                      images = Array.from(imagesFileList),
                      imageData = images.map((image) => ({
                        name: image.name,
                        size: image.size,
                        uuid: uuidv4(),
                        ext: image.name.toLowerCase().split('.').pop(),
                        type: uploadType.IMAGE,
                        file: image,
                      }));

                /**
                 * This is a 4 step process to upload the image.
                 * 1. Validate the image files
                 * 2. Insert blob version of the image
                 * 3. Attempt to upload the images (supports retries)
                 * 4. If upload eventually succeeds we replace the blob image url with resize url.
                 *    If it fails or is canceled we remove the blob image altogether from the wysiwyg field.
                 */
                // 1. VALIDATION
                try {
                  imageData.forEach((image) => {
                    if (image.size > newOptions.imageMaxSize) {
                      throw new Error(`This file exceeds maximum allowed size of ${newOptions.imageMaxSize / 1024 / 1024}MB`);
                    }
                    if (!newOptions.imageAllowedTypes.includes(`.${image.ext}`)) {
                      throw new Error(`Image type <b>${image.ext}</b> not allowed.<br />
                                       Allowed file extensions: ${newOptions.imageAllowedTypes.join(', ')}`);
                    }
                  });
                } catch (error) {
                  errorPrompt({html: error.message});
                  return false; // returning false stops the upload
                }

                // DO UPLOAD
                // Insert blob version of image - doesn't return ref to image 🙄 stupid froala
                images.forEach((image, index) => editor.image.insert(URL.createObjectURL(image), false, {'data-temp-index': index}));
                // Do API calls
                self.doUpload({imageData})
                  .then(([uploadsToPears]) => {
                    // Update the src on the image to point to resized url not blob
                    uploadsToPears.forEach(({data: upload}, index) => {
                      const el = editor.$el[0].querySelector(`[data-temp-index="${index}"]`),
                            url = `/api/uploads/image-variant/${upload.id}/?size=${self.buildSizeParam(el)}&redirect=1`;
                      el.style.maxWidth = '100%';
                      // WARNING
                      // ALL DATA ATTRIBUTES STRIPPED by editor.image.insert - keeps style and class
                      // eslint-disable-next-line no-undef
                      editor.image.insert(url, false, {}, $(el));
                      self.$emit('addImage', upload); // at this moment we consider the image successfully "added"
                    });
                  })
                  .catch(() => {
                    // API calls failed, and retry was either unsuccessful and/or canceled - remove (all) blob images
                    // eslint-disable-next-line no-undef
                    editor.image.remove($('[data-temp-index]')); // requires jquery object...
                  });
                return false; // returning false stops the upload
              },
              'image.error': function() {
                // console.error('image.error', e);
                errorPrompt({text: 'Image upload failed! Please try again later.'});
              },
              'image.removed': function($img) {
                const el = $img[0],
                      isBlobImg = el.src.startsWith('blob');

                if (isBlobImg) return; // don't emit if we're removing blob

                // get upload ID out of URL
                let uploadId = self.getUploadIdFromUrl(el.src);

                if (!uploadId) return; // don't emit if we can't find/derive an upload id

                self.$emit('removeImage', parseInt(uploadId, 10));
              },
              'image.loaded': function($img) {
                // only run for images with blob url - tempIndex data attr is present until real image loads
                if ($img[0].dataset.tempIndex !== undefined) {
                  // when you return false from beforeUpload it kills the upload progress bar - we must bring it back to life RESPAWN YO
                  this.image.showProgressBar();
                }
              },
              'image.resizeEnd': function($img) {
                // Swap out the src on the page for updated query string params for W/H
                // should only ever be one resized at a time.
                const el = $img[0],
                      url = new URL(el.src),
                      sizeParam = self.buildSizeParam(el),
                      id = self.getUploadIdFromUrl(el.src);
                // reset the size param based on the style applied to the element
                url.searchParams.set('size', sizeParam);
                // reset the image src to the new image resize URL
                el.src = `${url.pathname}${url.search}`;
                self.$emit('resizeImage', {id, base_options: {size: sizeParam}});
                // eslint-disable-next-line no-undef
                this.image.insert(`${url.pathname}${url.search}`, false, {}, $(el));
              },
              ...optionOverrides.events,
            },
          };

    this.editor = new FroalaEditor(this.$refs.editor, newOptions);
  },
  methods: {
    updateDisabled() {
      if (!this.editor) throw Error('Editor is not defined yet');
      if (this.disabled) {
        this.editor.edit.off();
      } else {
        this.editor.edit.on();
      }
    },
    /**
     * Upload API calls - allows for retry if user desires
     * Three separate sets of API calls:
     * 1. Fetch presigned POST urls
     * 2. async POST file to S3
     * 3. async POST upload resource create
     *
     * @param {Object} imageData is an array of objects
     * @return {Promise} resolves to array with [uploadsToPears, uploadsToS3]
     */
    async doUpload({imageData}) {
      try {
        // 1. get presigned post urls
        const {data: presignedUrls} = await this.$store.api.post('/api/uploads/get-presigned-post-url/', {
          file_names: imageData.map((meta) => `${meta.uuid}.${meta.ext}`),
        }),

          // 2. post file to S3 (async) as form data - response is 204 no data
              uploadsToS3 = Promise.all(presignedUrls.map((presignedUrl, index) => this.$store.api.post(
                presignedUrl.url, objectToFormData({
                  ...presignedUrl.fields,
                  file: imageData[index].file,
                }),
              ))),

          // 3. At same time add to uploads resource table in pears DB
              uploadsToPears = Promise.all(imageData.map(({file, ...item}, index) => this.$store.api.post('/api/uploads/upload/', {
                ...item,
                path: presignedUrls[index].fields.key,
              })));

        return await Promise.all([uploadsToPears, uploadsToS3]);
      } catch (error) {
        // console.error(error);
        const willRetry = await confirmPrompt({
          title: 'Error', text: 'There was an error uploading the image. Do you wish to retry?', confirmButtonText: 'Yes, Retry', type: 'warning',
        });
        if (willRetry) {
          return this.doUpload({imageData});
        }
        return Promise.reject(new Error('Retry was canceled'));
      }
    },

    /**
     * Images can be scaled / cropped against a single dimension by using zero as the placeholder in the size.
     * For example, size=(100, 0) will cause the image to be resized to 100 pixels wide, keeping the aspect ratio of the source image.
     * @see https://easy-thumbnails.readthedocs.io/en/latest/ref/processors/
     * @param {HTMLElement} el
     * @return {string} in form "<W>x<H>" i.e. 300x300 or 300x0
     */
    buildSizeParam(el) {
      return `${el.style.width.replace('px', '')}x${el.style.height ? el.style.height.replace('px', '') : 0}`;
    },

    /**
     *
     * @param {String} url - in the form http://<origin>/api/uploads/image-variant/${upload.id}/
     */
    getUploadIdFromUrl(url) {
      return new URL(url).pathname.split('/')[4];
    },
  },
};

</script>
