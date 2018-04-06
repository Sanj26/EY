var CompanyBox = React.createClass({
  getInitialState: function() {
    //this will hold all the data being read and posted to the file
    return {data: []};
  },
  loadCompanyInformationFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        //set the state with the newly loaded data so the display will update
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  componentDidMount: function() {
    //Once the component is fully loaded, we grab the donations
    this.loadCompanyInformationFromServer();
    //... and set an interval to continuously load new data:
    setInterval(this.loadCompanyInformationFromServer, this.props.pollInterval);
  },
  handleCompanySubmit: function(company) {
    //this is just an example of how you would submit a form
    //you would have to implement something separately on the server
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: company,
      success: function(data) {
        //We set the state again after submission, to update with the submitted data
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  render: function() {
    //we list donations, then show the form for new donations
    return (
      <div className="companyBox">
        <h1>Prospective Company Data</h1>
        <CompanyList data={this.state.data} />
        <CompanyForm onCompanySubmit={this.handleCompanySubmit} />
      </div>
    );
  }
});

var CompanyList = React.createClass({
  render: function() {
    var companyNodes = this.props.data.map(function(company) {
      //map the data to individual donations
      return (
        <Company
          companyname={company.companyname}
          key={company.id}
          amount={company.amount}
        >
          {company.comment}
        </Company>
      );
    });
    //print all the nodes in the list
    return (
      <div className="companyList">
        {companyNodes}
      </div>
    );
  }
});

var Company = React.createClass({
  render: function() {
    //display an individual company
    return (
      <div className="company">
        <div className="companyDetails">
          {this.props.companyname}: ${this.props.amount}
        </div>
          {this.props.children.toString()}
      </div>
    );
  }
});

var CompanyForm = React.createClass({
  getInitialState: function() {
    return {
      companyname: "",
      amount: undefined,
      comment: "",
      email: "",
      department: undefined
    };
  },
  handleSubmit: function(e) {
    //we don't want the form to submit, so we prevent the defaul behavior
    e.preventDefault();
    console.log('in handle submit');
    //we clean up the data as we save it
    var companyname = this.state.companyname.trim();
    var amount = this.state.amount;
    var comment = this.state.comment.trim();
    console.log(companyname + amount + comment);
    //these two items are required
    if (!companyname || !amount) {
      return;
    }
    
    //Here we do the final submit to the parent component
    this.props.onCompanySubmit({companyname: companyname, amount: amount, comment: comment});
    
    //Now that the form is submitted, we empty all the fields
    this.setState({
      companyname: '',
      amount: undefined,
      comment: '',
      email: '',
      department: undefined
    });
  },
  validateEmail: function (value) {
    // regex from http://stackoverflow.com/questions/46155/validate-email-address-in-javascript
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(value);
  },
  validateDollars: function (value) {
    //will accept dollar amounts with two digits after the decimal or no decimal
    //will also accept a number with or without a dollar sign
    var regex  = /^\$?[0-9]+(\.[0-9][0-9])?$/;
    return regex.test(value);
  },
  commonValidate: function () {
    //you could do something here that does general validation for any form field
    return true;
  },
  setValue: function (field, event) {
    //If the companyname input field were directly within this
    //this component, we could use this.refs.companyname.value
    //Instead, we want to save the data for when the form is submitted
    var object = {};
    object[field] = event.target.value;
    this.setState(object);
  },
  render: function() {
    //Each form field is actually another component.
    //Two of the form fields use the same component, but with different variables
    return (
      <form className="companyForm" onSubmit={this.handleSubmit}>
        <h2>Company Information</h2>
      
        <TextInput
          value={this.state.email}
          uniqueName="email"
          text="Email Address"
          textArea={false}
          required={true}
          minCharacters={6}
          validate={this.validateEmail}
          onChange={this.setValue.bind(this, 'email')} 
          errorMessage="Email is invalid"
          emptyMessage="Email is required" />

        <TextInput
          value={this.state.companyname}
          uniqueName="companyname"
          text="Company Name"
          textArea={false}
          required={true}
          minCharacters={3}
          validate={this.commonValidate}
          onChange={this.setValue.bind(this, 'companyname')} 
          errorMessage="Name is invalid"
          emptyMessage="Name is required" />
          
        <TextInput
          value={this.state.amount}
          uniqueName="amount"
          text="amount (in $)"
          textArea={false}
          required={true}
          validate={this.validateDollars}
          onChange={this.setValue.bind(this, 'amount')} 
          errorMessage="Amount is invalid"
          emptyMessage="Amount is required" />

        <TextInput
          value={this.state.comment}
          uniqueName="comment"
          text="Something about the company"
          textArea={true}
          required={false}
          validate={this.commonValidate}
          onChange={this.setValue.bind(this, 'comment')} 
          errorMessage=""
          emptyMessage="" />

        <h4>Select the type of company</h4>
        <Department
          value={this.state.department} 
          onChange={this.setValue.bind(this, 'department')} />
        <input type="submit" value="Submit" />
      </form>
    );
  }
});

/*
  This is a small error component that is displayed inline
  within every form field component
*/
var InputError = React.createClass({
  getInitialState: function() {
    return {
      message: 'Input is invalid'
    };
  },
  render: function(){ 
    var errorClass = classNames(this.props.className, {
      'error_container':   true,
      'visible':           this.props.visible,
      'invisible':         !this.props.visible
    });

    return (
      <div className={errorClass}>
        <span>{this.props.errorMessage}</span>
      </div>
    )
  }

});

var TextInput = React.createClass({
  getInitialState: function(){
    //most of these variables have to do with handling errors
    return {
      isEmpty: true,
      value: null,
      valid: false,
      errorMessage: "Input is invalid",
      errorVisible: false
    };
  },

  handleChange: function(event){
    //validate the field locally
    this.validation(event.target.value);

    //Call onChange method on the parent component for updating it's state
    //If saving this field for final form submission, it gets passed
    // up to the top component for sending to the server
    if(this.props.onChange) {
      this.props.onChange(event);
    }
  },

  validation: function (value, valid) {
    //The valid variable is optional, and true if not passed in:
    if (typeof valid === 'undefined') {
      valid = true;
    }
    
    var message = "";
    var errorVisible = false;
    
    //we know how to validate text fields based on information passed through props
    if (!valid) {
      //This happens when the user leaves the field, but it is not valid
      //(we do final validation in the parent component, then pass the result
      //here for display)
      message = this.props.errorMessage;
      valid = false;
      errorVisible = true;
    }
    else if (this.props.required && jQuery.isEmptyObject(value)) {
      //this happens when we have a required field with no text entered
      //in this case, we want the "emptyMessage" error message
      message = this.props.emptyMessage;
      valid = false;
      errorVisible = true;
    }
    else if (value.length < this.props.minCharacters) {
      //This happens when the text entered is not the required length,
      //in which case we show the regular error message
      message = this.props.errorMessage;
      valid = false;
      errorVisible = true;
    }
    
    //setting the state will update the display,
    //causing the error message to display if there is one.
    this.setState({
      value: value,
      isEmpty: jQuery.isEmptyObject(value),
      valid: valid,
      errorMessage: message,
      errorVisible: errorVisible
    });

  },

  handleBlur: function (event) {
    //Complete final validation from parent element when complete
    var valid = this.props.validate(event.target.value);
    //pass the result to the local validation element for displaying the error
    this.validation(event.target.value, valid);
  },
  render: function() {
    if (this.props.textArea) {
      return (
        <div className={this.props.uniqueName}>
          <textarea
            placeholder={this.props.text}
            className={'input input-' + this.props.uniqueName}
            onChange={this.handleChange}
            onBlur={this.handleBlur}
            value={this.props.value} />
      
          <InputError 
            visible={this.state.errorVisible} 
            errorMessage={this.state.errorMessage} />
        </div>
      );
    } else {
      return (
        <div className={this.props.uniqueName}>
          <input
            placeholder={this.props.text}
            className={'input input-' + this.props.uniqueName}
            onChange={this.handleChange}
            onBlur={this.handleBlur}
            value={this.props.value} />
      
          <InputError 
            visible={this.state.errorVisible} 
            errorMessage={this.state.errorMessage} />
        </div>
      );
    }
  }
});


var Department = React.createClass({
  getInitialState: function() {
    return {
      displayClass: 'invisible'
    };
  },
  handleClick: function(e) {
    //We're doing another one of these "any value" fields, only shown when
    //a specific "other" option is chosen
    this.props.onChange(e);
    var displayClass = 'invisible';
    if (e.target.value == 'other') {
      displayClass = 'visible';
    }
    this.setState({displayClass: displayClass});
  },
  render: function() {
    //This is a select field with options and sub-options, plus an "any value" field
    var value = this.props.value;
    if (this.props.value != undefined && ['a', 'b', 'c', 'x', 'y', 'z', 'agriculture'].indexOf(this.props.value) == -1) {
      value = 'other';
    }
    else if (this.props.value == undefined) {
      value = 'none';
    }
    
    return (
      <div className="department">
        <select value={value} onChange={this.handleClick} multiple={false} ref="department">
          <option value="none"></option>
          <optgroup label="Manufacturing">
            <option value="a">a</option>
            <option value="b">b</option>
            <option value="c">c</option>
          </optgroup>
          <optgroup label="Chemical">
            <option value="x">x</option>
            <option value="y">y</option>
            <option value="z">z</option>
          </optgroup>
          <option value="agriculture">Agriculture</option>
          <option value="other">Other</option>
        </select>
        <div className={this.state.displayClass}>
          <input className="anyValue" value={this.props.value=='other'?'':this.props.value} type="text" onChange={this.props.onChange} placeholder="Department" ref="any-department" />
        </div>
      
        <InputError 
          visible={this.state.errorVisible} 
          errorMessage={this.state.errorMessage} />
      </div>
    );
  }
});

ReactDOM.render(
  <CompanyBox url="/api/company" pollInterval={2000} />,
  document.getElementById('content')
);
