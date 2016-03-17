import React, { Component, PropTypes } from "react";

import {
  getDefaultFormState,
  orderProperties,
  retrieveSchema
} from "../../utils";


class ObjectField extends Component {
  static defaultProps = {
    uiSchema: {}
  }

  constructor(props) {
    super(props);
    this.state = this.getStateFromProps(props);
  }

  componentWillReceiveProps(nextProps) {
    this.setState(this.getStateFromProps(nextProps));
  }

  getStateFromProps(props) {
    const {schema, formData, registry} = props;
    return getDefaultFormState(schema, formData, registry.definitions) || {};
  }

  isRequired(name) {
    const schema = this.props.schema;
    return Array.isArray(schema.required) &&
      schema.required.indexOf(name) !== -1;
  }

  asyncSetState(state) {
    // ensure state is propagated to parent component when it's actually set
    this.setState(state, _ => this.props.onChange(this.state));
  }

  onChange(name, value) {
    this.asyncSetState({[name]: value});
  }

  render() {
    const {uiSchema, name} = this.props;
    const {SchemaField, TitleField, definitions} = this.props.registry;
    const schema = retrieveSchema(this.props.schema, definitions);
    const title = schema.title || name;
    let orderedProperties;
    try {
      const properties = Object.keys(schema.properties);
      orderedProperties = orderProperties(properties, uiSchema["ui:order"]);
    } catch(err) {
      return (
        <div>
          <p className="config-error" style={{color: "red"}}>
            Invalid {name || "root"} object field configuration:
            <em>{err.message}</em>.
          </p>
          <pre>{JSON.stringify(schema)}</pre>
        </div>
      );
    }
    return (
      <fieldset>
        {title ? <TitleField title={title}/> : null}
        {schema.description ?
          <div className="field-description">{schema.description}</div> : null}
        {
        orderedProperties.map((name, index) => {
          return (
            <SchemaField key={index}
              name={name}
              required={this.isRequired(name)}
              schema={schema.properties[name]}
              uiSchema={uiSchema[name]}
              formData={this.state[name]}
              onChange={this.onChange.bind(this, name)}
              registry={this.props.registry} />
          );
        })
      }</fieldset>
    );
  }
}

if (process.env.NODE_ENV !== "production") {
  ObjectField.propTypes = {
    schema: PropTypes.object.isRequired,
    uiSchema: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    formData: PropTypes.object,
    required: PropTypes.bool,
    registry: PropTypes.shape({
      SchemaField: PropTypes.func.isRequired,
      TitleField: PropTypes.func.isRequired
    })
  };
}

export default ObjectField;
