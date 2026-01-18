import Late from '@getlatedev/node';




class connect {

    
    private profile : any;
    private accounts : any;

    public constructor() {

    }

    public async createProfile() {
        const response = await fetch('https://getlate.dev/api/v1/profiles', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.lateKay}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              name: 'My First Profile',
              description: 'Testing the Late API'
            })
          });
          
          const { profile } = await response.json();
          this.profile = profile;
          console.log('Profile created:', profile._id);
    }
    //may need to reconnect / delete connection for new account
    public async connect() {
        const response = await fetch(
            `https://getlate.dev/api/v1/connect/twitter?profileId=${this.profile._id}`,
            {
              headers: {
                'Authorization': `Bearer ${process.env.lateKey}`
              }
            }
          );
          
          const { authUrl } = await response.json();
          // Redirect user to this URL to authorize
          window.location.href = authUrl;
    }

    public async getAccounts() {
        const response = await fetch('https://getlate.dev/api/v1/accounts', {
            headers: {
              'Authorization': `Bearer ${process.env.lateKey}`
            }
          });
          
          const { accounts } = await response.json();
          this.accounts = accounts;
          console.log('Connected accounts:', accounts);
    }


    public async post() {
        const response = await fetch('https://getlate.dev/api/v1/posts', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.lateKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              content: 'This posts immediately!',
              publishNow: true,
              platforms: [
                { platform: 'youtube', accountId: `${this.accounts[0]._id}` }
              ]
            })
          });
          
          const { post } = await response.json();
          console.log('Published:', post._id);

    }
}
