import subprocess

def resolve_dns(domain):
    result = subprocess.run(['dig', '+short', domain], stdout=subprocess.PIPE)
    return result.stdout.decode('utf-8')

if __name__ == "__main__":
    domain = "example.com"
    print(resolve_dns(domain))

