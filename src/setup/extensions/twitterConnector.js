import {
  task,
} from '@/components/nodes';

window.ProcessMaker.EventBus.$on('modeler-init', ({ registerNode }) => {
  /* Add a custom node example */

  const implementation = 'processmaker-social-twitter-send';
  const nodeId = 'processmaker-connectors-social-twitter-send';

  const component = {
    extends: task.component,
  };

  const nodeType = {
    id: nodeId,
    component,
    bpmnType: 'bpmn:ServiceTask',
    control: true,
    category: 'Social',
    icon: require('@/assets/toolpanel/task.svg'),
    label: 'Send Tweet',
    definition(moddle) {
      return moddle.create('bpmn:ServiceTask', {
        name: 'Send Tweet',
        implementation,
        config: JSON.stringify({ tweet: '' }),
      });
    },
    diagram(moddle) {
      return moddle.create('bpmndi:BPMNShape', {
        bounds: moddle.create('dc:Bounds', {
          height: 80,
          width: 100,
        }),
      });
    },
    /* Map values from inspector data to node definition  */
    inspectorHandler(value, node) {
      // Go through each property and rebind it to our data
      const definition = node.definition;
      const config = JSON.parse(definition.config);

      for (const key in value) {
        if (key in config) {
          config[key] = value[key];
        } else if (definition[key] !== value[key]) {
          definition[key] = value[key];
        }
      }

      definition.config = JSON.stringify(config);
    },
    /* Map values from node definition to inspector data */
    inspectorData(definition) {
      return Object.entries(definition).reduce((data, [key, value]) => {
        if (key === 'config') {
          try {
            const config = JSON.parse(value);
            return { ...data, ...config };
          } catch (error) {
            /* Ignore invalid JSON */
          }
        }

        data[key] = value;
        return data;
      }, {});
    },
    inspectorConfig: [
      {
        name: 'Send Tweet',
        items: [
          {
            component: 'FormText',
            config: {
              label: 'Send Tweet',
              fontSize: '2em',
            },
          },
          {
            component: 'FormInput',
            config: {
              label: 'Identifier',
              helper: 'The id field should be unique across all elements in the diagram',
              name: 'id',
            },
          },
          {
            component: 'FormTextArea',
            config: {
              label: 'Tweet Body',
              helper: 'The Body Of The Tweet to Send',
              name: 'tweet',
            },
          },
        ],
      },
    ],
  };

  registerNode(nodeType, definition => {
    if (definition.get('implementation') === implementation) {
      return nodeId;
    }
  });
});
