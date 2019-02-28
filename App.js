import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View} from 'react-native';

import { withAuthenticator } from 'aws-amplify-react-native';

import { API, graphqlOperation } from 'aws-amplify'
import { listTalks as ListTalks } from './src/graphql/queries'
import { createTalk as CreateTalk } from './src/graphql/mutations'
import { ListItem, Button, Input } from 'react-native-elements'
import { onCreateTalk } from './src/graphql/subscriptions'

class App extends Component {
  state = { talks: [], name: '', speakerName: '', speakerBio: ''}
  
  async componentDidMount() {
    API.graphql(
      graphqlOperation(onCreateTalk)
    ).subscribe({
      next: (eventData) => {
        console.log('eventData', eventData)
        const talk = eventData.value.data.onCreateTalk
        const talks = [
          ...this.state.talks.filter(t => {
            const val1 = t.name + t.speakerName
            const val2 = talk.name + talk.speakerName
            return val1 !== val2
          }),
          talk
        ]
        this.setState({ talks })
      }
    })
    
    try{
      const { data: { listTalks: { items } } } = await
      API.graphql(graphqlOperation(ListTalks))
      this.setState({ talks: items})
    } catch (err) {
      console.log('error fetching data: ', err)
    }
  }

  onChange = (key, value) => {
    this.setState({ [key]: value})
  }

  createTalk = async () => {
    const talk = {
      name: this.state.name,
      speakerName: this.state.speakerName,
      speakerBio: this.state.speakerBio,
    }
    const talks = [...this.state.talks, talk]
    this.setState({ talks, name: '', speakerName: '', speakerBio: ''})
    try {
      await API.graphql(graphqlOperation(CreateTalk, {input: talk}))
      console.log('talk successfully created!!!')
    } catch (err) {
      console.log('error: ', err)
    }
  }
  
  render() {
    return (
      <View style={styles.container}>
        <Input
          onChangeText={v => this.onChange('name', v)}
          placeholder='Talk Name'
          value={this.state.name}
        />
        <Input
          onChangeText={v => this.onChange('speakerName', v)}
          placeholder='Speaker Name'
          value={this.state.speakerName}
        />
        <Input
          onChangeText={v => this.onChange('speakerBio', v)}
          placeholder='Speaker Bio'
          value={this.state.speakerBio}
        />
        <Button
          style={{ margin: 20 }}
          onPress={this.createTalk}
          title='Create Talk'
          backgroundColor='#ffa100'
        />
        {
          this.state.talks.map((item, i) =>(
            <ListItem
              key={i}
              title={item.name}
              subtitle={item.speakerName}
            />
          ))
        }
      </View>
    );
  }
}




const theme = StyleSheet.create({
  ...AmplifyTheme,
  container: {
    ...AmplifyTheme.container,
    backgroundColor: '#FFFFFF'
  }
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});


export default withAuthenticator(App, {
  includeGreetings: true
}, [], null, theme) 

// export default withAuthenticator(App, {
//   includeGreetings: true}) 