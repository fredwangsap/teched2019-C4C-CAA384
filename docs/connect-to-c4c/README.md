# Connect C4C to SAP Cloud Platform Extension Factory (Kyma Runtime)

First thing we need to do is to create a *Namespace*, a Namespace is an isolated environment where you can deploy your extension applications.

## Create Namespace
To create a namespace simply click on the button *+ Create Namespace* which can be found in the kyma console's Overview Page

![kyma create namespace](./assets/kyma&#32;create&#32;namespace.png)

Give a name to your namespace eg: *ted-c4c* and click on *Create*

![kyma namespace details](./assets/kyma&#32;namespace&#32;details.png)

## Create *Application*
A resource called *Application* represents a placeholder for external enterprise solution you wish to extend via the Kyma Runtime, in our case it would be *C4C*. 

To create an Application place holder follow the following steps:

Click on *Applications* item present over the kyma menu bar.
![kyma home](./assets/kyma&#32;home.png)

In the *Applications* UI, click on *"+ Create Application"* Button, this would allow you to create a placeholder for c4c.

![kyma create application](./assets/kyma&#32;create&#32;application.png)

Give a name to your Application placeholder, As the application we are extending is "C4C", lets call the *Application* as *C4C*. 

And Now, Click on *Create*

![kyma add application details](./assets/kyma&#32;add&#32;application&#32;details.png)

You should be able to see your application in the list of Applications.

Now, Select the Application *c4c* from the list, to go to it's detail page.

![kyma go to application](./assets/kyma&#32;go&#32;to&#32;application.png)

## Bind Application to namespace

It doesn't make sense to use the API and events from any external solution throughout the cluster, Therefore, kyma gives you an option to expose your external application's API and events at a namespace level, this could be done via creating Application Binding. With this Binding Kyma exposes the API and event metadata only to a particular namespace. And this metadata can be viewed in the *Service Catalog* (to be discussed later.)

To bind your Application to a namespace, simply Click on *Create Binding* button on your Application's detail page.

![kyma application binding to namespace](./assets/kyma&#32;application&#32;binding&#32;to&#32;namespace.png)

Select the namespace you want your Application to be be exposing it's metadata and click on *Create*.

![kyma create application binding](./assets/kyma&#32;create&#32;application&#32;binding.png)

## Connect to C4C

To successfully extend any enterprise solutions, We need to publish the core offerings of these solutions. These core offerings can be either a public API to read/write data into the system or an asynchronous event where a listener could react to any operation performed in the system.

In the following steps, we'd configure C4C to send it's events to our kyma runtime. First thing we need is a connection url, which c4c can use to provision event consumers.

- ### In Kyma

Click on *Connect Application* from the Application detail page.

![kyma application page](./assets/kyma&#32;application&#32;page.png)

Copy the token url by Clicking on *Copy to clipboard*

![kyma connect to application](./assets/kyma&#32;connect&#32;to&#32;application.png)

- ### In C4C
Login to C4C system and go to *General Settings* in the *Administrator* menu.

![c4c home](assets/c4c&#32;home&#32;go&#32;to&#32;general&#32;settings.png)

In the *General Settings* Tabs look for the *System Administration* Option and click on *Event Notification*

![c4c general settings](assets/c4c&#32;go&#32;to&#32;event&#32;notification.png)

Select *Add* to add an event consumer

![c4c add event consumer](assets/c4c&#32;add&#32;event&#32;consumer.png)

Choose type as *SAP Cloud Platform Extension Factory*

![c4c select consumer type](assets/c4c&#32;add&#32;consumer&#32;type.png)

in the Remote Environment URL enter the url you copied from *Kyma* Application page. and in the callback user and password, enter your *C4C* Login credentials and then click on *Save*

![c4c connect to kyma](assets/c4c&#32;add&#32;consumer&#32;connection&#32;detail.png)

Add Subscription by clicking on *Add*

![c4c add event subscriber](assets/c4c&#32;add&#32;subscription.png)

Select the Business Object *Ticket* Node *Root* and option *Created* from *Add Subscription* menu, this will add kyma as a consumer for the event *Ticket Created*

![c4c event details](assets/c4c&#32;Add&#32;Event&#32;to&#32;be&#32;subscribed.png)

Click on *Save* and then *Activate*

![c4c activate event consumer](assets/c4c&#32;activate&#32;connection.png)

- ### In Kyma

Now refresh your *"c4c"* *Application* page in the kyma console. you should be able to see the registered API and events from *C4C* (SAP Sales Cloud)

![Kyma Application Page post connect](assets/kyma&#32;check&#32;application&#32;registration.png)

Now Go back to *Namespaces* Page in kyma console and navigate to your bound namespace. (Reminder: A bound namespace is the namespace you've created your *Application* binding, for more details refer to [Bind Application to namespace](#Bind-Application-to-namespace) section) 

![Kyma go to bound namespace](assets/kyma&#32;go&#32;to&#32;bound&#32;namespace.png)

From here, navigate to *Catalog* section as highlighted below. A successful registration of your *C4C* tenant should add a item in the catalog

![Kyma go to Service Catalog](assets/kyma&#32;go&#32;to&#32;service&#32;catalog.png)

From the catalog page go to *Services* tab.

![Kyma Service Catalog](assets/kyma&#32;go&#32;to&#32;services.png)

You should be able to see a service entry which corresponds to *C4C*. Now let's have a look at the service metadata, so simply click on the service tile.

![Kyma Service Entry of C4C APIs](assets/kyma&#32;validate&#32;SAP&#32;Sales&#32;Cloud&#32;Service&#32;in&#32;catalog.png)

What you see now is the registered API and event metadata that *C4C* has published in the Kyma - runtime

**Information** : This metadata is exposed to your namespace only because you've created an application binding. But to consume these services you need to create it's instance. Because, the metadata is simply a template made available to your namespace. A Service in the catalog can be considered analogous to *Classes* in Object Oriented Programming. and similarly like classes you create an *instance* to make use of it. In the same way we create *Service Instance*

#### Create Service Instance

To Create Service Instance of *SAP Sales Cloud* service click in *Add Once* Button. and then go to *Instances* page by clicking on the option as highlited below by arrow number *3*. 

![Kyma add service instance](assets/kyma&#32;check&#32;subscribed&#32;event.png)

In the service instace page, go to *Services* tab.

![Kyma Service instance page](assets/kyma&#32;service&#32;instance.png)

You should be able to see the service instance created for *SAP Sales Cloud*. Click on your service instance and navigate to its details page.

![Kyma check service instance](assets/kyma&#32;check&#32;service&#32;instance&#32;created.png)

Validate Status as **Running**

![Kyma Service instance details](assets/kyma&#32;check&#32;instance&#32;status.png)

**With this guide, you've learned how to connect *SAP Sales Cloud* to *SAP Cloud Platform Extension Factory - Kyma runtime*.**

**In further section, we'll learn how to use these service in a lambda function**