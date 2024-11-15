# C-alcohol
C-alcohol is a blood-alcohol-concentration calculator built for a mobile-first experience.
It is not intended to keep track of your actual alcohol level and is only for educational purposes.
The app was built since I couldn't find BAC-calculators which are easily usable on mobile devices.

The original purpose is to use the app in an educational setting: in schools, in external workshops or at home as a family. The philosophical approach behind the design is so called non-judgemental drug-prevention. The idea is that human beings, and teenagers even more, are curious beings, who want to try things out no matter the legal jurisdictions. Just because alcohol is forbidden for teenagers doesn't mean that they don't drink. In a non-judgemental drug-prevention workshop we acknowledge exactly that: It is quite likely that teenagers will try alcohol and we rather help them to make informed decisions than to pretend that just because it is prohibited, they should and would not drink alcohol.

## Try, vomit and error
A common problem is that teenagers do not know how much alcohol affects them in what way. So the only way that most humans learn about their alcohol tolerance is try, vomit and error.

By allowing users to input their data (only locally, no data is sent anywhere) and experiment with different drinks at different times, they can get an idea for how much they individually can drink.

Blood alcohol levels depend mainly on three factors:
- body size
- body weight
- gender (due to differences in body fat percentage)

### Caveats
Modern calculations include age. While this algorithm is not implemented yet, I already included the input field.
There is no data for intersex. I still found it important for teenagers who identify as inter to recognize them and include the option. Calculation-wise it uses the same numbers as females. Females tend to get drunk faster due to the allocation of body fat, and I would rather teach inter teenagers to be more cautios than to suggest to them that they can drink more.

We all know that in real-life the food you had before or while drinking is just as important, I couldn't find an algorithm that is able to include this data. Therefor I included a section about how food affects alcohol absorption rate and reccomend to simply make the teenagers aware of it.


## App structure
There are four main parts in the app:
- User info including a popup that allows to change the information about the user
- Clock, which is the clock where user can add and delete drinks.
- Chart, which is where the BAC is calculated and displayed.
- Menu, which includes functionality like switching languages, the qr-code and links to other parts of the website, which include information on how this app can be used in different educational settings.

### The clock
I chose a clock as an interface to select drinks and display them, since a drinking occasion usually stays within a 12hour-cycle. Emojis are used to differntiate different types of drinks.

![Screenshot of the clock interface](documentation/clock-documentation.png)

### The diagram
The diagram displays the blood alcohol level over the course of the night. The last point on the x-axis is whenever the user would get back to 0% to showcase how long it takes to metabolize the alcohol.

Again emojis are displayed on top of the diagram to illustrate what was drunk.
Clicking on the chart gives users information about how the current BAC influences human behaviour and physiology.

![Screenshot of the diagram](documentation/diagram-documentation.png)

## Tech stack
I intentionally tried to keep things simple and therefor implemented this only with vanilla html, css and javascript.
Two external libraries are used via cdn:
- Chart.js for the diagram that displays the BAC
- QRcode.js for the dynamic generation of the websites URL as a QR-code to make it easier in a workshop setting to share the link.


## Deployment
To deploy the app, just put it on your server or deploy on a service like vercel/Railway through auto-deploy by linking to the repository on Github/Gitlab. You do not need to set up a database since all data is stored in the browser's local storage.


## Roadmap:

- allow users to choose their own starttime of the fictional party
- update to a more modern calculation method that includes age