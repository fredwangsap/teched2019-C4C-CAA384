## Deploy Lambda Function

In this guide, we'll create a Lambda function which will be triggered as soon as a Ticket is Created in the *C4C (SAP Sales Cloud) system*. Execute the following steps to create a lambda function.

### Pre-requisites
- You've followed step-by-step guide to connect to C4C as described [here](../connect-to-c4c/README.md)
- You've copied the API Key and the sandbozx url for SAP Leonardo Image Classification Service, as described [here](../train-leonardo/README.md)


Go to the namespace where you've bound you *Application*. 

![Lambda](assets/lambda&#32;1.png)

Click on *Lambdas*

![Lambda](assets/lambda&#32;2.png)

Click on *"+ Add Lambda"*

![Lambda](assets/lambda&#32;3.png)

Select a function trigger by clicking in the button.

![Lambda](assets/lambda&#32;4.png)

Select type *Event Trigger* from the pop-up list.

![Lambda](assets/lambda&#32;5.png)

Select Event *Ticket.Root.Created* from the Event List and then click on *Add*. This specifies that this lambda function will be executed whenever a ticket is created in *C4C*.

![Lambda](assets/lambda&#32;6.png)

Add the node.js lambda code in the editor (code can be found [here](../../Lambda/lambda.js))

![Lambda](assets/lambda&#32;7.png)

The node.js code added uses a couple of npm(Node package manager) dependencies. You can add dependencies by toggeling the button below.

![Lambda](assets/lambda&#32;8.png)

Add npm dependencies as mentioned in this [file](../../Lambda/package.json)

![Lambda](assets/lambda&#32;9.png)

We'd like to use *C4C* APIs in this lambda function, for that we need to create a *Service Binding*, to create a Service Binding we should have a Service Instance available as mentioned [here](../connect-to-c4c/README.md)

Click on *Create Service Binding*

![Lambda](assets/lambda&#32;10.png)

Select the *Service Instance* from the dropdown and then click on *Create Service Binding*

![Lambda](assets/lambda&#32;11.png)

Add additional environment variables to our lambda function to utilise Leonardo Image Classification API

Add the Environment Variable `APIKEY` and `LEONARDO_URL`. You must have got these values by following [this step](../train-leonardo/README.md)

![Lambda](assets/lambda&#32;12.png)

![Lambda](assets/lambda&#32;13.png)

Check if the Environment Variables were added correctly, from the lambda UI.

![Lambda](assets/lambda&#32;14.png)

Scroll at the top of the Lambda UI Page and click on *Create*. and check the status of your lambda function from the list of Lambda function in your namespace.

![Lambda](assets/lambda&#32;15.png)

![Lambda](assets/lambda&#32;16.png)

![Lambda](assets/lambda&#32;17.png)

**With this Guide, you can create a lambda function and bind it to a C4C service instance**